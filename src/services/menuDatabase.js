
import { supabase } from './supabase';

export async function fetchMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*');

  if (error) {
    console.error('Failed to fetch menu items:', error);
    throw error;
  }

  return data.map((row) => ({
    ...row.item_data,
    id: row.id,
    titleEn: row.title_en,
    titleMr: row.title_mr,
    price: Number(row.price),
    category: row.category,
    inStock: row.in_stock,
  }));
}

export async function saveMenuItems(items) {
  const rows = items.map((item) => ({
    id: item.id,
    title_en: item.titleEn,
    title_mr: item.titleMr,
    price: Number(item.price ?? 0),
    category: item.category ?? null,
    in_stock: item.inStock ?? true,
    item_data: item,
  }));

  // Insert or update current items.
  if (rows.length > 0) {
    const { error } = await supabase
      .from('menu_items')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('Failed to save menu items:', error);
      throw error;
    }
  }

  // Remove items deleted from the owner menu.
  const { data: existing, error: readError } = await supabase
    .from('menu_items')
    .select('id');

  if (readError) throw readError;

  const currentIds = new Set(items.map((item) => item.id));
  const deletedIds = existing
    .map((row) => row.id)
    .filter((id) => !currentIds.has(id));

  if (deletedIds.length > 0) {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .in('id', deletedIds);

    if (error) {
      console.error('Failed to delete menu items:', error);
      throw error;
    }
  }
}
