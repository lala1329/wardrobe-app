import { supabase } from "./supabaseClient";

// ---- Профиль ----
export async function loadProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    gender: data.gender,
    height: data.height,
    clothingSize: data.clothing_size,
    shoeSize: data.shoe_size,
    eyeColor: data.eye_color,
    hairColor: data.hair_color,
    ageRange: data.age_range,
  };
}

export async function saveProfile(userId, profile) {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    gender: profile.gender,
    height: profile.height,
    clothing_size: profile.clothingSize,
    shoe_size: profile.shoeSize,
    eye_color: profile.eyeColor,
    hair_color: profile.hairColor,
    age_range: profile.ageRange,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ---- Вещи гардероба ----
export async function loadWardrobeItems(userId) {
  const { data, error } = await supabase
    .from("wardrobe_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    subcategory: row.subcategory,
    colorId: row.color_id,
    colorLabel: row.color_label,
    colorHex: row.color_hex,
    seasonId: row.season_id,
    patternColorIds: row.pattern_color_ids || [],
    silhouetteId: row.silhouette_id || null,
    lengthId: row.length_id || null,
    styleId: row.style_id || null,
    wearCount: row.wear_count || 0,
    photos: row.photos || [],
    photo: row.photos && row.photos.length > 0 ? row.photos[0] : null,
    name: row.name,
    brand: row.brand,
    note: row.note,
    size: row.size,
    price: row.price,
    currencyId: row.currency_id,
    createdAt: new Date(row.created_at).getTime(),
  }));
}

export async function addWardrobeItem(userId, item, photoUrls) {
  const { data, error } = await supabase
    .from("wardrobe_items")
    .insert({
      user_id: userId,
      category_id: item.categoryId,
      subcategory: item.subcategory,
      color_id: item.colorId,
      color_label: item.colorLabel,
      color_hex: item.colorHex,
      season_id: item.seasonId,
      pattern_color_ids: item.patternColorIds || [],
      silhouette_id: item.silhouetteId || null,
      length_id: item.lengthId || null,
      style_id: item.styleId || null,
      wear_count: item.wearCount || 0,
      photos: photoUrls || [],
      name: item.name || null,
      brand: item.brand || null,
      note: item.note || null,
      size: item.size || null,
      price: item.price,
      currency_id: item.currencyId,
    })
    .select()
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateWardrobeItem(itemId, updates) {
  const dbUpdates = {};
  // Категория / тип / цвет — ВАЖНО: при редактировании вещи через форму (включая
  // повторное AI-распознавание) эти поля должны обновляться в базе, иначе изменения
  // теряются при следующей загрузке (старое значение "перетирает" новое из формы).
  if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
  if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
  if (updates.colorId !== undefined) dbUpdates.color_id = updates.colorId;
  if (updates.colorLabel !== undefined) dbUpdates.color_label = updates.colorLabel;
  if (updates.colorHex !== undefined) dbUpdates.color_hex = updates.colorHex;
  if (updates.seasonId !== undefined) dbUpdates.season_id = updates.seasonId;
  if (updates.patternColorIds !== undefined) dbUpdates.pattern_color_ids = updates.patternColorIds;
  if (updates.silhouetteId !== undefined) dbUpdates.silhouette_id = updates.silhouetteId;
  if (updates.lengthId !== undefined) dbUpdates.length_id = updates.lengthId;
  if (updates.styleId !== undefined) dbUpdates.style_id = updates.styleId;
  if (updates.wearCount !== undefined) dbUpdates.wear_count = updates.wearCount;
  if (updates.photos !== undefined) dbUpdates.photos = updates.photos;
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
  if (updates.note !== undefined) dbUpdates.note = updates.note;
  if (updates.size !== undefined) dbUpdates.size = updates.size;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.currencyId !== undefined) dbUpdates.currency_id = updates.currencyId;
  const { error } = await supabase.from("wardrobe_items").update(dbUpdates).eq("id", itemId);
  if (error) throw error;
}

export async function deleteWardrobeItem(itemId) {
  const { error } = await supabase.from("wardrobe_items").delete().eq("id", itemId);
  if (error) throw error;
}

// ---- Фото: загрузка в Supabase Storage ----
export async function uploadPhoto(userId, dataUrl, fileName) {
  // Конвертируем data URL (base64) в Blob для загрузки
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const filePath = `${userId}/${Date.now()}-${fileName}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("wardrobe-photos")
    .upload(filePath, blob, { contentType: "image/jpeg" });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from("wardrobe-photos").getPublicUrl(filePath);
  return data.publicUrl;
}
