import { supabase } from './supabase';

export async function signInOwner(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signOutOwner() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getOwnerSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}