-- ==============================================================================
-- Anuprita's Kitchen - Supabase SQL Migration
-- Purpose:
--   1. Secure persistent tracking for First-Open Devices (public.app_devices)
--   2. Secure customer profiles & login tracking (public.app_users)
--   3. Secure aggregate dashboard metrics RPC (get_admin_dashboard_metrics)
--   4. Hardened Row Level Security (RLS) - NO permissive anon write/modify
-- Instructions:
--   Run this script in the Supabase Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Table: public.app_devices (Track unique first-open devices)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_devices (
    id TEXT PRIMARY KEY,
    platform TEXT DEFAULT 'unknown',
    first_opened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_devices ENABLE ROW LEVEL SECURITY;

-- Allow authenticated owners to view device records
DROP POLICY IF EXISTS "Owners can view app_devices" ON public.app_devices;
CREATE POLICY "Owners can view app_devices"
ON public.app_devices
FOR SELECT
TO authenticated
USING (true);

-- ------------------------------------------------------------------------------
-- 2. Table: public.app_users (Track customer profiles & logins)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner')),
    name TEXT,
    mobile TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist if table was created in an earlier migration
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Remove old overly-permissive policies
DROP POLICY IF EXISTS "Allow login tracking upsert" ON public.app_users;
DROP POLICY IF EXISTS "Owners can view and manage app_users" ON public.app_users;

-- Authenticated users (owners/admins) can view and manage all rows
CREATE POLICY "Owners can view and manage app_users"
ON public.app_users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. Secure RPC: Record Device First-Open
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_device_first_open(
    device_id TEXT,
    device_platform TEXT DEFAULT 'unknown'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF device_id IS NULL OR length(trim(device_id)) = 0 THEN
        RETURN false;
    END IF;

    INSERT INTO public.app_devices (id, platform, first_opened_at)
    VALUES (trim(device_id), COALESCE(device_platform, 'unknown'), timezone('utc'::text, now()))
    ON CONFLICT (id) DO NOTHING;

    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_device_first_open(TEXT, TEXT) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 4. Secure RPC: Customer Login & Profile Upsert
-- Hardens role to 'customer' preventing privilege escalation to 'owner'
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_customer_login(
    customer_phone TEXT,
    customer_name TEXT DEFAULT NULL,
    customer_address TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    clean_phone TEXT;
    stable_id TEXT;
    result_record public.app_users%ROWTYPE;
BEGIN
    -- Normalize phone to last 10 digits
    clean_phone := substring(regexp_replace(COALESCE(customer_phone, ''), '\D', '', 'g') from '([0-9]{10})$');
    
    IF clean_phone IS NULL OR length(clean_phone) != 10 THEN
        RAISE EXCEPTION 'Invalid 10-digit mobile number';
    END IF;

    stable_id := 'cust_' || clean_phone;

    INSERT INTO public.app_users (id, role, name, mobile, address, created_at, last_login_at)
    VALUES (
        stable_id,
        'customer',
        NULLIF(trim(customer_name), ''),
        clean_phone,
        NULLIF(trim(customer_address), ''),
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE SET
        last_login_at = timezone('utc'::text, now()),
        name = COALESCE(NULLIF(trim(EXCLUDED.name), ''), public.app_users.name),
        address = COALESCE(NULLIF(trim(EXCLUDED.address), ''), public.app_users.address)
        -- role is intentionally NOT updated from EXCLUDED to prevent privilege escalation
    RETURNING * INTO result_record;

    RETURN json_build_object(
        'id', result_record.id,
        'name', result_record.name,
        'mobile', result_record.mobile,
        'address', result_record.address,
        'role', result_record.role,
        'last_login_at', result_record.last_login_at,
        'created_at', result_record.created_at
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_customer_login(TEXT, TEXT, TEXT) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 5. Secure RPC: Customer Profile Lookup by Mobile
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_customer_profile(
    customer_phone TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    clean_phone TEXT;
    stable_id TEXT;
    found_user public.app_users%ROWTYPE;
BEGIN
    clean_phone := substring(regexp_replace(COALESCE(customer_phone, ''), '\D', '', 'g') from '([0-9]{10})$');
    
    IF clean_phone IS NULL OR length(clean_phone) != 10 THEN
        RETURN NULL;
    END IF;

    stable_id := 'cust_' || clean_phone;

    SELECT * INTO found_user
    FROM public.app_users
    WHERE id = stable_id AND role = 'customer';

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    RETURN json_build_object(
        'id', found_user.id,
        'name', found_user.name,
        'mobile', found_user.mobile,
        'address', found_user.address,
        'role', found_user.role,
        'last_login_at', found_user.last_login_at,
        'created_at', found_user.created_at
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_profile(TEXT) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 6. Secure RPC: Owner Admin Dashboard Metrics
-- Returns aggregate metrics for the 3 cards. Excludes owner/admin accounts.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    device_count integer := 0;
    registered_count integer := 0;
    logged_in_count integer := 0;
BEGIN
    -- 1. App First-Open Devices
    SELECT count(*)::integer INTO device_count
    FROM public.app_devices;

    -- 2. Total Registered Customers (excluding owner accounts)
    SELECT count(*)::integer INTO registered_count
    FROM public.app_users
    WHERE role = 'customer' AND name IS NOT NULL AND trim(name) != '';

    -- 3. Unique Customers Logged In (distinct customer logins, excluding owner)
    SELECT count(DISTINCT id)::integer INTO logged_in_count
    FROM public.app_users
    WHERE role = 'customer' AND last_login_at IS NOT NULL;

    RETURN json_build_object(
        'first_open_devices', COALESCE(device_count, 0),
        'total_registered_customers', COALESCE(registered_count, 0),
        'unique_customers_logged_in', COALESCE(logged_in_count, 0)
    );
END;
$$;

-- Allow authenticated owners and anon to execute the aggregate count function
-- (returns numbers only, no personal data)
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_metrics() TO anon, authenticated;

-- ==============================================================================
-- Verification Query (Run this in SQL editor to test):
-- SELECT public.get_admin_dashboard_metrics();
-- ==============================================================================
