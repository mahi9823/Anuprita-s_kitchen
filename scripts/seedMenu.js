
import { createClient } from '@supabase/supabase-js';
import { INITIAL_ITEMS } from '../src/data/foodData.js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables are missing.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedMenu() {
  const email = process.env.SUPABASE_OWNER_EMAIL;
  const password = process.env.SUPABASE_OWNER_PASSWORD;

  if (!email || !password) {
    throw new Error('Owner credentials are missing from .env');
  }

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError) {
    console.error('OWNER LOGIN FAILED:', authError);
    throw new Error('Owner login failed.');
  }

  console.log('Owner login successful:', Boolean(authData.user?.id));
  console.log('Checking menu_items table...');

  const { data: existingItems, error: readError } = await supabase
    .from('menu_items')
    .select('id');

  if (readError) {
    console.error('DATABASE READ FAILED:', readError);
    console.error(
      'Full error:',
      JSON.stringify(readError, Object.getOwnPropertyNames(readError), 2)
    );
    throw new Error('Could not read menu_items.');
  }

  const count = existingItems.length;
  console.log('Database query returned. Count:', count);

  if (count > 0) {
    console.log(`Database already has ${count} items. Seed skipped.`);
    return;
  }

  const rows = INITIAL_ITEMS.map((item) => ({
    id: item.id,
    title_en: item.titleEn ?? item.titleEn,
    title_mr: item.titleMr,
    price: Number(item.price ?? 0),
    category: item.category ?? null,
    in_stock: item.inStock ?? true,
    item_data: item,
  }));

  console.log(`Preparing ${rows.length} menu items...`);

  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);

    const { error } = await supabase
      .from('menu_items')
      .insert(batch);

    if (error) {
      console.error(`Upload failed at batch starting ${i}:`, error);
      throw new Error('Menu upload failed.');
    }

    console.log(`Uploaded ${Math.min(i + 50, rows.length)} items`);
  }

  console.log('Menu upload completed successfully.');
}

seedMenu()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await supabase.auth.signOut();
  });
