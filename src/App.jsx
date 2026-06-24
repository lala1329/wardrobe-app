import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Shirt, Footprints, ShoppingBag, Gem, Snowflake, Sun, CloudSun, Search, LayoutGrid, CloudRain, Briefcase, Coffee, Dumbbell, PartyPopper, Sparkles, RefreshCw, Calendar, User, Ruler, Eye, Check, Camera, Columns3, PersonStanding, Umbrella, LogOut } from "lucide-react";
import { supabase } from "./supabaseClient";
import AuthScreen from "./AuthScreen";
import {
  loadProfile,
  saveProfile,
  loadWardrobeItems,
  addWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
  uploadPhoto,
} from "./dataStore";

// ---- Категории и подкатегории ----
const CATEGORIES = [
  {
    id: "tops",
    label: "Верх",
    shortLabel: "Верх",
    icon: Shirt,
    sub: ["Футболка", "Рубашка", "Блузка", "Водолазка", "Лонгслив", "Свитер / джемпер", "Жилет"],
  },
  {
    id: "bottoms",
    label: "Низ",
    shortLabel: "Низ",
    icon: Columns3,
    sub: ["Джинсы", "Брюки", "Юбка", "Шорты", "Легинсы", "Спортивные брюки"],
  },
  {
    id: "dresses",
    label: "Платья",
    shortLabel: "Платья",
    icon: PersonStanding,
    sub: ["Платье", "Комбинезон"],
  },
  {
    id: "outerwear",
    label: "Верхняя одежда",
    shortLabel: "Верхняя",
    icon: Umbrella,
    sub: [
      "Куртка",
      "Джинсовая куртка",
      "Пиджак",
      "Жакет",
      "Накидка",
      "Утеплённый жилет",
      "Пальто",
      "Плащ",
      "Пуховик",
    ],
  },
  {
    id: "shoes",
    label: "Обувь",
    shortLabel: "Обувь",
    icon: Footprints,
    sub: [
      "Кроссовки",
      "Кеды",
      "Ботинки",
      "Угги",
      "Туфли",
      "Балетки",
      "Лоферы / мокасины",
      "Сапоги",
      "Сандалии / мюли",
      "Шлёпанцы / вьетнамки",
      "Эспадрильи",
    ],
  },
  {
    id: "bags",
    label: "Сумки",
    shortLabel: "Сумки",
    icon: ShoppingBag,
    sub: ["Рюкзак", "Клатч", "Сумка через плечо", "Тоут"],
  },
  {
    id: "accessories",
    label: "Аксессуары",
    shortLabel: "Аксес.",
    icon: Gem,
    sub: ["Украшения", "Шарф", "Шапка", "Перчатки", "Пояс", "Очки"],
  },
];

const SEASONS = [
  { id: "winter", label: "Зима", icon: Snowflake },
  { id: "demi", label: "Деми", icon: CloudSun },
  { id: "summer", label: "Лето", icon: Sun },
];

const COLORS = [
  { id: "black", label: "Чёрный", hex: "#1a1a1a" },
  { id: "white", label: "Белый", hex: "#fafafa" },
  { id: "cream", label: "Кремовый", hex: "#f0e6d2" },
  { id: "beige", label: "Бежевый", hex: "#d9c7ab" },
  { id: "gray", label: "Серый", hex: "#9a9a93" },
  { id: "graphite", label: "Графитовый", hex: "#3f3f3f" },
  { id: "brown", label: "Коричневый", hex: "#6b4a35" },
  { id: "camel", label: "Камель", hex: "#b08552" },
  { id: "khaki", label: "Хаки", hex: "#7a7a4f" },
  { id: "olive", label: "Оливковый", hex: "#5c5c2f" },
  { id: "navy", label: "Тёмно-синий", hex: "#27324a" },
  { id: "blue", label: "Синий", hex: "#5b7ea0" },
  { id: "denim", label: "Деним", hex: "#4a6b8a" },
  { id: "turquoise", label: "Бирюзовый", hex: "#3e9a96" },
  { id: "mint", label: "Мятный", hex: "#a8d5ba" },
  { id: "green", label: "Зелёный", hex: "#4c5e3f" },
  { id: "yellow", label: "Жёлтый", hex: "#cfa83e" },
  { id: "gold", label: "Золотой", hex: "#c9a85c" },
  { id: "orange", label: "Оранжевый", hex: "#cc6e3a" },
  { id: "red", label: "Красный", hex: "#a8362a" },
  { id: "burgundy", label: "Бордовый", hex: "#6e1f2b" },
  { id: "pink", label: "Розовый", hex: "#d99a9a" },
  { id: "purple", label: "Фиолетовый", hex: "#6b4d7a" },
  { id: "lavender", label: "Лавандовый", hex: "#b8a9d9" },
  { id: "silver", label: "Серебряный", hex: "#c4c4c4" },
  { id: "multi", label: "Принт / разноцветный", hex: "linear-gradient(135deg,#a8362a,#cfa83e,#5b7ea0)" },
];

// ---- Данные профиля пользователя ----
const GENDERS = ["Женский", "Мужской", "Не указывать"];

const CLOTHING_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const SHOE_SIZES_EU = Array.from({ length: 22 }, (_, i) => 34 + i); // 34–55

const EYE_COLORS = [
  { id: "brown", label: "Карие", hex: "#5b3a21" },
  { id: "blue", label: "Голубые", hex: "#7fa8c9" },
  { id: "green", label: "Зелёные", hex: "#5e8a5a" },
  { id: "gray", label: "Серые", hex: "#9aa3a8" },
  { id: "hazel", label: "Ореховые", hex: "#8a6a3f" },
];

const HAIR_COLORS = [
  { id: "black", label: "Чёрный", hex: "#1c1410" },
  { id: "brown", label: "Каштановый", hex: "#5a3a24" },
  { id: "blonde", label: "Светлый / блонд", hex: "#d9c08a" },
  { id: "red", label: "Рыжий", hex: "#a8522f" },
  { id: "gray", label: "Седой / серый", hex: "#a8a39c" },
  { id: "other", label: "Другой / окрашен", hex: "#7a6a8a" },
];

const AGE_RANGES = ["До 18", "18–24", "25–34", "35–44", "45–54", "55+"];

// ---- Валюты для цены вещи (AZN по умолчанию) ----
const CURRENCIES = [
  { id: "azn", symbol: "₼", label: "AZN" },
  { id: "rub", symbol: "₽", label: "RUB" },
  { id: "usd", symbol: "$", label: "USD" },
  { id: "eur", symbol: "€", label: "EUR" },
  { id: "try", symbol: "₺", label: "TRY" },
];

const DAY_TYPES = [
  {
    id: "casual",
    label: "Повседневный",
    icon: Coffee,
    sub: ["Обычный день", "Прогулка", "Концерт", "Кафе с друзьями", "Шоппинг", "Путешествие"],
  },
  {
    id: "business",
    label: "Деловой",
    icon: Briefcase,
    sub: ["Офис", "Переговоры", "Собеседование", "Конференция", "Деловой ужин"],
  },
  {
    id: "sport",
    label: "Спортивный",
    icon: Dumbbell,
    sub: ["Зал", "Бег", "Йога", "Поход", "Активный отдых"],
  },
  {
    id: "party",
    label: "Праздничный",
    icon: PartyPopper,
    sub: ["Свидание", "День рождения", "Свадьба", "Вечеринка", "Торжественный приём"],
  },
];

const NEUTRAL_COLORS = ["black", "white", "cream", "beige", "gray", "graphite", "navy", "brown", "camel", "khaki", "silver"];

// Какие подкатегории допустимы для каждого типа дня (фильтр-исключение)
const DAY_TYPE_EXCLUDE = {
  business: [
    "Шорты",
    "Кроссовки",
    "Кеды",
    "Сандалии / мюли",
    "Шлёпанцы / вьетнамки",
    "Эспадрильи",
    "Спортивный костюм",
    "Футболка",
    "Легинсы",
    "Спортивные брюки",
  ],
  sport: ["Туфли", "Балетки", "Лоферы / мокасины", "Сапоги", "Угги", "Пальто", "Платье", "Джинсы", "Брюки", "Юбка"],
  party: ["Шорты", "Кроссовки", "Кеды", "Легинсы", "Спортивные брюки"],
  casual: [],
};

// Уточнения внутри сценария: либо доп. исключения, либо смягчение базового правила
const SCENARIO_RULES = {
  "Поход": {
    allowBack: ["Кроссовки"],
    extraExclude: ["Туфли", "Балетки", "Лоферы / мокасины", "Сапоги", "Эспадрильи"],
  },
  "Офис": { extraExclude: ["Джинсовая куртка"] },
  "Собеседование": { extraExclude: ["Накидка", "Джинсовая куртка", "Лонгслив"] },
  "Конференция": { extraExclude: ["Накидка", "Джинсовая куртка"] },
  "Переговоры": { extraExclude: ["Накидка", "Джинсовая куртка", "Лонгслив"] },
  "Деловой ужин": { allowBack: ["Туфли"], extraExclude: ["Кроссовки", "Кеды"] },
  "Свадьба": {
    extraExclude: [
      "Кроссовки",
      "Кеды",
      "Угги",
      "Шлёпанцы / вьетнамки",
      "Джинсовая куртка",
      "Накидка",
      "Футболка",
      "Джинсы",
      "Шорты",
      "Лонгслив",
      "Рюкзак",
    ],
  },
  "Торжественный приём": {
    extraExclude: [
      "Кроссовки",
      "Кеды",
      "Угги",
      "Шлёпанцы / вьетнамки",
      "Джинсовая куртка",
      "Футболка",
      "Джинсы",
      "Шорты",
      "Лонгслив",
      "Рюкзак",
    ],
  },
  "Вечеринка": { extraExclude: ["Сапоги", "Угги", "Футболка", "Джинсы", "Рюкзак"] },
  "Свидание": { extraExclude: ["Кроссовки", "Кеды", "Спортивные брюки", "Легинсы", "Рюкзак"] },
  "День рождения": { extraExclude: ["Спортивные брюки", "Легинсы"] },
  "Йога": { allowBack: ["Шорты"], extraExclude: ["Шапка", "Перчатки", "Украшения"] },
  "Активный отдых": { allowBack: ["Шорты"] },
  "Зал": { extraExclude: ["Украшения", "Шапка"] },
  "Бег": { extraExclude: ["Украшения", "Шапка", "Сумка через плечо", "Клатч", "Тоут"] },
};

// ---- Получение погоды по геолокации через Open-Meteo (бесплатный API, без ключа) ----
function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code`;
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Не удалось получить погоду");
      return res.json();
    })
    .then((data) => {
      const current = data.current;
      const temp = Math.round(current.temperature_2m);
      const precipitation = current.precipitation || 0;
      const weatherCode = current.weather_code;
      // Коды осадков по WMO: 51-67 дождь/мокрый снег, 71-77 снег, 80-99 ливни/град
      const isPrecipCode = (weatherCode >= 51 && weatherCode <= 99) || precipitation > 0;
      return { temp, rain: isPrecipCode };
    });
}

function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Геолокация не поддерживается этим браузером"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      (error) => {
        reject(error);
      },
      { timeout: 10000 }
    );
  });
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Сжимает изображение перед сохранением — ограничивает максимальную сторону и качество,
// чтобы фото не превышали лимит хранилища (особенно важно при нескольких фото на вещь)
function compressImage(file, maxSize = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---- Логика подбора образа по правилам ----
// Категория вещи -> слот в образе
const CATEGORY_TO_SLOT = {
  outerwear: "outerwear",
  dresses: "dress",
  tops: "top",
  bottoms: "bottom",
  shoes: "shoes",
  bags: "bag",
  accessories: "accessory",
};

// С какими категориями вещь логически сочетается (для расчёта % совместимости)
const PAIRS_WITH = {
  tops: ["bottoms"],
  bottoms: ["tops"],
  dresses: [],
  outerwear: ["tops", "bottoms", "dresses"],
  shoes: ["tops", "bottoms", "dresses"],
  bags: ["tops", "bottoms", "dresses"],
  accessories: ["tops", "bottoms", "dresses"],
};

function colorsCompatible(colorIdA, colorIdB) {
  if (NEUTRAL_COLORS.includes(colorIdA) || NEUTRAL_COLORS.includes(colorIdB)) return true;
  return colorIdA === colorIdB;
}

function calcMatchScore(item, allItems) {
  const pairCategories = PAIRS_WITH[item.categoryId] || [];
  if (pairCategories.length === 0) {
    const candidates = allItems.filter(
      (i) => i.id !== item.id && ["shoes", "bags", "accessories", "outerwear"].includes(i.categoryId)
    );
    if (candidates.length === 0) return null;
    const matches = candidates.filter((i) => colorsCompatible(item.colorId, i.colorId));
    return Math.round((matches.length / candidates.length) * 100);
  }

  const candidates = allItems.filter((i) => i.id !== item.id && pairCategories.includes(i.categoryId));
  if (candidates.length === 0) return null;
  const matches = candidates.filter((i) => colorsCompatible(item.colorId, i.colorId));
  return Math.round((matches.length / candidates.length) * 100);
}

function suggestForLowMatch(item) {
  const categoryLabel =
    item.categoryId === "tops" || item.categoryId === "dresses"
      ? "низ"
      : item.categoryId === "bottoms"
      ? "верх"
      : "вещи";
  return `Добавьте в гардероб нейтральный ${categoryLabel} (чёрный, белый, бежевый, серый) — это поможет этой вещи сочетаться с большим количеством образов.`;
}

function buildPinterestSearchUrl(item) {
  const query = `${item.colorLabel} ${item.subcategory} с чем носить сочетание`;
  return `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
}

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month === 12 || month === 1 || month === 2) return "winter";
  if (month >= 6 && month <= 8) return "summer";
  return "demi";
}

function pickOutfit(items, { temp, rain, dayType, scenario, pinnedItems = [] }) {
  const baseExclude = DAY_TYPE_EXCLUDE[dayType] || [];
  const scenarioRule = SCENARIO_RULES[scenario] || {};
  const allowBack = scenarioRule.allowBack || [];
  const extraExclude = scenarioRule.extraExclude || [];
  const effectiveExclude = [...baseExclude.filter((s) => !allowBack.includes(s)), ...extraExclude];

  const currentSeason = getCurrentSeason();

  function prioritizeBySeason(pool) {
    const seasonMatch = pool.filter(
      (i) => i.seasonId === currentSeason || i.seasonId === "demi" || !i.seasonId
    );
    return seasonMatch.length > 0 ? seasonMatch : pool;
  }

  const usable = (cat) =>
    prioritizeBySeason(items.filter((i) => i.categoryId === cat && !effectiveExclude.includes(i.subcategory)));

  const needsOuterwear = temp < 18 || rain;
  const warmthLevel = temp < 0 ? "heavy" : temp < 10 ? "mid" : temp < 18 ? "light" : "none";

  const pinnedBySlot = {};
  pinnedItems.forEach((item) => {
    const slot = CATEGORY_TO_SLOT[item.categoryId];
    if (!slot) return;
    if (!pinnedBySlot[slot]) pinnedBySlot[slot] = [];
    pinnedBySlot[slot].push(item);
  });

  const outfit = {};
  Object.keys(pinnedBySlot).forEach((slot) => {
    const options = pinnedBySlot[slot];
    outfit[slot] = options[Math.floor(Math.random() * options.length)];
  });
  const pinnedSlots = Object.keys(outfit);

  let shoesPool = usable("shoes");
  if (rain) {
    shoesPool = shoesPool.filter(
      (s) =>
        !["Сандалии / мюли", "Туфли", "Шлёпанцы / вьетнамки", "Эспадрильи", "Балетки"].includes(
          s.subcategory
        )
    );
  }
  if (warmthLevel === "none") {
    shoesPool = shoesPool.filter((s) => !["Сапоги", "Ботинки", "Угги"].includes(s.subcategory));
  }
  if (warmthLevel === "heavy" || warmthLevel === "mid") {
    shoesPool = shoesPool.filter(
      (s) => !["Сандалии / мюли", "Шлёпанцы / вьетнамки", "Эспадрильи"].includes(s.subcategory)
    );
  }
  if (dayType === "sport") {
    const sportShoes = scenario === "Поход" ? ["Кроссовки", "Кеды", "Ботинки"] : ["Кроссовки", "Кеды"];
    shoesPool = shoesPool.filter((s) => sportShoes.includes(s.subcategory));
  }

  let outerwearPool = usable("outerwear");
  if (warmthLevel === "heavy") {
    outerwearPool = outerwearPool.filter((o) =>
      ["Пуховик", "Пальто"].includes(o.subcategory)
    );
  } else if (warmthLevel === "mid") {
    outerwearPool = outerwearPool.filter((o) =>
      ["Куртка", "Пальто", "Жакет", "Пиджак", "Утеплённый жилет"].includes(o.subcategory)
    );
  } else if (warmthLevel === "light") {
    outerwearPool = outerwearPool.filter((o) =>
      ["Джинсовая куртка", "Жакет", "Пиджак", "Накидка", "Утеплённый жилет", "Плащ"].includes(o.subcategory)
    );
  }

  const dressPool = usable("dresses");
  const formalScenarios = ["Свадьба", "Торжественный приём"];
  const dressChanceThreshold = formalScenarios.includes(scenario) ? 0.25 : 0.6;
  const wantsDress =
    !pinnedSlots.includes("top") &&
    !pinnedSlots.includes("bottom") &&
    !pinnedSlots.includes("dress") &&
    dayType !== "sport" &&
    dressPool.length > 0 &&
    Math.random() > dressChanceThreshold;

  const topPool = usable("tops");
  const bottomPool = usable("bottoms");
  const bagPool = usable("bags");
  const accessoryPool = usable("accessories");

  function pickColorAware(pool, anchorColorId) {
    if (pool.length === 0) return null;
    if (!anchorColorId) return pool[Math.floor(Math.random() * pool.length)];
    const isAnchorNeutral = NEUTRAL_COLORS.includes(anchorColorId);
    const compatible = pool.filter((p) => {
      if (NEUTRAL_COLORS.includes(p.colorId)) return true;
      if (isAnchorNeutral) return true;
      return p.colorId === anchorColorId;
    });
    const finalPool = compatible.length > 0 ? compatible : pool;
    return finalPool[Math.floor(Math.random() * finalPool.length)];
  }

  if (!pinnedSlots.includes("dress") && wantsDress) {
    outfit.dress = dressPool[Math.floor(Math.random() * dressPool.length)];
  } else {
    if (!pinnedSlots.includes("top")) {
      outfit.top = topPool.length ? topPool[Math.floor(Math.random() * topPool.length)] : null;
    }
    if (!pinnedSlots.includes("bottom")) {
      outfit.bottom = outfit.top
        ? pickColorAware(bottomPool, outfit.top.colorId)
        : bottomPool[Math.floor(Math.random() * bottomPool.length)] || null;
    }
  }

  const anchor = outfit.dress || outfit.bottom || outfit.top;

  if (!pinnedSlots.includes("outerwear") && needsOuterwear) {
    outfit.outerwear = pickColorAware(outerwearPool, anchor?.colorId);
  }
  if (!pinnedSlots.includes("shoes")) {
    outfit.shoes = pickColorAware(shoesPool, anchor?.colorId);
  }
  if (!pinnedSlots.includes("bag")) {
    outfit.bag = bagPool.length ? pickColorAware(bagPool, anchor?.colorId) : null;
  }
  if (!pinnedSlots.includes("accessory")) {
    outfit.accessory = accessoryPool.length ? pickColorAware(accessoryPool, anchor?.colorId) : null;
  }

  const missing = [];
  if (!outfit.dress && !outfit.top) missing.push("верх");
  if (!outfit.dress && !outfit.bottom) missing.push("низ");
  if (!outfit.shoes) missing.push("обувь");
  if (needsOuterwear && !outfit.outerwear) missing.push("верхняя одежда для такой погоды");

  return { outfit, missing, needsOuterwear, warmthLevel, pinnedSlots };
}

const EYE_FLATTERING_COLORS = {
  brown: ["green", "yellow", "red", "beige"],
  blue: ["blue", "navy", "yellow", "beige"],
  green: ["red", "brown", "beige", "green"],
  gray: ["navy", "gray", "pink", "blue"],
  hazel: ["green", "brown", "yellow"],
};

const HAIR_FLATTERING_COLORS = {
  black: ["red", "white", "yellow", "pink"],
  brown: ["green", "beige", "blue"],
  blonde: ["navy", "blue", "brown"],
  red: ["green", "navy", "brown"],
  gray: ["navy", "pink", "blue"],
  other: ["black", "white", "gray"],
};

function findColortypeNote(outfit, profile) {
  if (!profile) return null;
  const colorIds = Object.values(outfit)
    .filter(Boolean)
    .map((i) => i.colorId);

  const eyeMatches = EYE_FLATTERING_COLORS[profile.eyeColor] || [];
  const hairMatches = HAIR_FLATTERING_COLORS[profile.hairColor] || [];

  const eyeHit = colorIds.find((c) => eyeMatches.includes(c));
  const hairHit = colorIds.find((c) => hairMatches.includes(c));

  if (eyeHit) {
    const colorLabel = COLORS.find((c) => c.id === eyeHit)?.label.toLowerCase();
    const eyeLabel = EYE_COLORS.find((c) => c.id === profile.eyeColor)?.label.toLowerCase();
    return `${colorLabel} в этом образе красиво подчеркнёт ваши ${eyeLabel} глаза`;
  }
  if (hairHit) {
    const colorLabel = COLORS.find((c) => c.id === hairHit)?.label.toLowerCase();
    const hairLabel = HAIR_COLORS.find((c) => c.id === profile.hairColor)?.label.toLowerCase();
    return `${colorLabel} оттенок хорошо играет с вашим цветом волос (${hairLabel})`;
  }
  return null;
}

const STYLE_PHRASES = [
  "Лёгкий и сбалансированный образ",
  "Спокойное, уверенное сочетание",
  "Аккуратный и продуманный лук",
  "Комфортный вариант на весь день",
  "Свежее сочетание для настроения",
];

function describeOutfit(outfit, { temp, rain }) {
  const parts = [];
  const phrase = STYLE_PHRASES[Math.floor(Math.random() * STYLE_PHRASES.length)];
  parts.push(phrase);

  if (outfit.outerwear) parts.push(`с ${outfit.outerwear.subcategory.toLowerCase()} сверху`);
  if (rain) parts.push("учитывая дождь, обувь выбрана непромокаемая");
  else if (temp < 0) parts.push("утеплённый вариант на холодную погоду");

  return parts.join(", ") + ".";
}

function pickOutfits(items, params, profile, count = 3) {
  const results = [];
  const seenSignatures = new Set();
  let attempts = 0;

  while (results.length < count && attempts < count * 6) {
    attempts++;
    const r = pickOutfit(items, params);
    const signature = Object.values(r.outfit)
      .filter(Boolean)
      .map((i) => i.id)
      .sort()
      .join("|");

    if (signature && seenSignatures.has(signature) && attempts < count * 5) continue;
    seenSignatures.add(signature);

    results.push({
      ...r,
      description: describeOutfit(r.outfit, params),
      colortypeNote: findColortypeNote(r.outfit, profile),
    });
  }

  return results;
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [screen, setScreen] = useState("wardrobe");
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState(null);
  const [pickMode, setPickMode] = useState(false);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [detailItemId, setDetailItemId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [storageDiagnostic, setStorageDiagnostic] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setItems([]);
        setProfile(null);
        setPinnedIds([]);
        setIsLoaded(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    async function loadData() {
      try {
        const loadedProfile = await loadProfile(session.user.id);
        if (!cancelled) setProfile(loadedProfile);
      } catch (e) {
        if (!cancelled) setSaveError(`Не удалось загрузить профиль: ${e?.message || "неизвестная ошибка"}`);
      }
      try {
        const loadedItems = await loadWardrobeItems(session.user.id);
        if (!cancelled) setItems(loadedItems);
      } catch (e) {
        if (!cancelled) setSaveError(`Не удалось загрузить гардероб: ${e?.message || "неизвестная ошибка"}`);
      }
      if (!cancelled) setIsLoaded(true);
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!isLoaded || !profile || !session?.user) return;
    let cancelled = false;

    async function doSave() {
      setSaveStatus("saving");
      try {
        await saveProfile(session.user.id, profile);
        if (!cancelled) {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus(null), 1500);
        }
      } catch (e) {
        if (!cancelled) {
          setSaveError(`Не удалось сохранить профиль: ${e?.message || "неизвестная ошибка"}`);
          setSaveStatus(null);
        }
      }
    }

    doSave();
    return () => {
      cancelled = true;
    };
  }, [profile, isLoaded, session?.user?.id]);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  async function resetAllData() {
    if (!session?.user) return;
    try {
      for (const item of items) {
        await deleteWardrobeItem(item.id);
      }
      setItems([]);
      setProfile(null);
      setPinnedIds([]);
    } catch (e) {
      setSaveError(`Не удалось сбросить данные: ${e?.message || "неизвестная ошибка"}`);
    }
  }

  async function addItem(item) {
    if (!session?.user) return;
    setSaveStatus("saving");
    try {
      const photoUrls = [];
      for (let i = 0; i < (item.photos || []).length; i++) {
        const url = await uploadPhoto(session.user.id, item.photos[i], `photo-${i}`);
        photoUrls.push(url);
      }

      const newId = await addWardrobeItem(session.user.id, item, photoUrls);
      const newItem = {
        ...item,
        id: newId,
        photos: photoUrls,
        photo: photoUrls[0] || null,
        createdAt: Date.now(),
      };
      setItems((prev) => [newItem, ...prev]);
      setShowAddSheet(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 1500);
    } catch (e) {
      setSaveError(`Не удалось добавить вещь: ${e?.message || "неизвестная ошибка"}`);
      setSaveStatus(null);
    }
  }

  async function removeItem(id) {
    try {
      await deleteWardrobeItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setPinnedIds((prev) => prev.filter((id2) => id2 !== id));
    } catch (e) {
      setSaveError(`Не удалось удалить вещь: ${e?.message || "неизвестная ошибка"}`);
    }
  }

  async function updateItemHandler(id, updates) {
    let finalUpdates = { ...updates };
    if (updates.photos) {
      const uploadedPhotos = [];
      for (let i = 0; i < updates.photos.length; i++) {
        const p = updates.photos[i];
        if (p.startsWith("data:")) {
          const url = await uploadPhoto(session.user.id, p, `photo-${Date.now()}-${i}`);
          uploadedPhotos.push(url);
        } else {
          uploadedPhotos.push(p);
        }
      }
      finalUpdates = { ...finalUpdates, photos: uploadedPhotos, photo: uploadedPhotos[0] || null };
    }

    try {
      await updateWardrobeItem(id, finalUpdates);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...finalUpdates } : i)));
    } catch (e) {
      setSaveError(`Не удалось обновить вещь: ${e?.message || "неизвестная ошибка"}`);
    }
  }

  function togglePinned(id) {
    setPinnedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function exitPickMode() {
    setPickMode(false);
    setPinnedIds([]);
  }

  function goBuildOutfit() {
    setPickMode(false);
    setScreen("outfit");
  }

  const filtered = items.filter((i) => {
    const matchesCat = activeCategory === "all" || i.categoryId === activeCategory;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      i.subcategory.toLowerCase().includes(q) ||
      i.colorLabel.toLowerCase().includes(q) ||
      (i.name && i.name.toLowerCase().includes(q)) ||
      (i.brand && i.brand.toLowerCase().includes(q)) ||
      (i.note && i.note.toLowerCase().includes(q)) ||
      (i.size && i.size.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  if (session === undefined) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "100vh", maxHeight: "100dvh", backgroundColor: "#f6f1e8", colorScheme: "light" }}
      >
        <div
          className="w-8 h-8 rounded-full border-3 animate-spin"
          style={{ borderColor: "#e3d8c4", borderTopColor: "#e0563a" }}
        />
      </div>
    );
  }

  if (session === null) {
    return <AuthScreen onAuthenticated={(s) => setSession(s)} />;
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "100vh", maxHeight: "100dvh", backgroundColor: "#f6f1e8", colorScheme: "light" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-3 animate-spin"
            style={{ borderColor: "#e3d8c4", borderTopColor: "#e0563a" }}
          />
          <p className="text-sm" style={{ color: "#8a7d6a" }}>
            Загрузка гардероба...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <OnboardingScreen onDone={(p) => setProfile(p)} />;
  }

  return (
    <div
      className="relative w-full overflow-hidden text-[#2a2520] font-sans flex flex-col"
      style={{
        height: "100vh",
        maxHeight: "100dvh",
        backgroundColor: "#f6f1e8",
        isolation: "isolate",
        colorScheme: "light",
      }}
    >
      {storageDiagnostic && (
        <div
          className="absolute top-0 left-0 right-0 z-[60] px-4 py-3 text-[11px] leading-relaxed text-left overflow-y-auto"
          style={{ backgroundColor: "#dce8d4", color: "#3a4f2f", maxHeight: "40vh" }}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <strong>Диагностика хранилища:</strong>
            <button onClick={() => setStorageDiagnostic(null)} className="underline shrink-0">
              Скрыть
            </button>
          </div>
          <div style={{ wordBreak: "break-word" }}>{storageDiagnostic}</div>
        </div>
      )}

      {saveError && (
        <div
          className="absolute top-0 left-0 right-0 z-[60] px-4 py-2.5 text-xs text-center flex items-center justify-center gap-2"
          style={{ backgroundColor: "#f0e6d4", color: "#6b5a3f", marginTop: storageDiagnostic ? "36px" : "0" }}
        >
          {saveError}
          <button onClick={() => setSaveError(null)} className="underline">
            Скрыть
          </button>
        </div>
      )}

      {screen === "wardrobe" && (
        <>
          <Header
            count={items.length}
            query={query}
            setQuery={setQuery}
            pickMode={pickMode}
            onTogglePickMode={() => (pickMode ? exitPickMode() : setPickMode(true))}
            saveStatus={saveStatus}
          />

          <div className="flex-1 flex max-w-2xl w-full mx-auto px-4 pb-24 pt-1 gap-3 min-h-0 overflow-y-auto">
            <CategoryRail active={activeCategory} setActive={setActiveCategory} />

            <main className="flex-1 min-w-0">
              {filtered.length === 0 ? (
                <EmptyState hasAny={items.length > 0} />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filtered.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      allItems={items}
                      onRemove={() => removeItem(item.id)}
                      pickMode={pickMode}
                      pinned={pinnedIds.includes(item.id)}
                      onTogglePin={() => togglePinned(item.id)}
                      onOpenDetail={() => setDetailItemId(item.id)}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>

          {pickMode ? (
            pinnedIds.length > 0 && (
              <button
                onClick={goBuildOutfit}
                className="absolute bottom-24 left-4 right-4 max-w-2xl mx-auto py-3.5 rounded-full text-sm font-medium shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
                style={{ backgroundColor: "#e0563a", color: "#ffffff" }}
              >
                <Sparkles size={15} />
                Собрать образ с выбранным ({pinnedIds.length})
              </button>
            )
          ) : (
            <button
              onClick={() => setShowAddSheet(true)}
              className="absolute bottom-24 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
              style={{ backgroundColor: "#e0563a", color: "#f6f1e8" }}
              aria-label="Добавить вещь"
            >
              <Plus size={26} strokeWidth={2.5} />
            </button>
          )}
        </>
      )}

      {screen === "outfit" && (
        <OutfitScreen
          items={items}
          profile={profile}
          pinnedIds={pinnedIds}
          onClearPinned={() => setPinnedIds([])}
        />
      )}
      {screen === "profile" && (
        <ProfileScreen profile={profile} setProfile={setProfile} onResetAll={resetAllData} onSignOut={handleSignOut} />
      )}

      {showAddSheet && (
        <AddItemSheet onClose={() => setShowAddSheet(false)} onAdd={addItem} />
      )}

      {detailItemId && (
        <ItemDetailSheet
          item={items.find((i) => i.id === detailItemId)}
          allItems={items}
          onClose={() => setDetailItemId(null)}
          onRemove={() => {
            removeItem(detailItemId);
            setDetailItemId(null);
          }}
          onUpdate={(updates) => updateItemHandler(detailItemId, updates)}
        />
      )}

      <TabBar screen={screen} setScreen={setScreen} />
    </div>
  );
}

function TabBar({ screen, setScreen }) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-[#f6f1e8]/95 backdrop-blur border-t border-[#e3d8c4] flex justify-center">
      <div className="max-w-2xl w-full flex">
        <TabButton
          label="Гардероб"
          icon={LayoutGrid}
          active={screen === "wardrobe"}
          onClick={() => setScreen("wardrobe")}
        />
        <TabButton
          label="Образ дня"
          icon={Sparkles}
          active={screen === "outfit"}
          onClick={() => setScreen("outfit")}
        />
        <TabButton
          label="Профиль"
          icon={User}
          active={screen === "profile"}
          onClick={() => setScreen("profile")}
        />
      </div>
    </nav>
  );
}

function TabButton({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-2.5 ${
        active ? "text-[#e0563a]" : "text-[#a89a82]"
      }`}
    >
      <Icon size={20} strokeWidth={active ? 2.4 : 2} />
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

function Header({ count, query, setQuery, pickMode, onTogglePickMode, saveStatus }) {
  return (
    <header className="px-4 pt-6 pb-3 max-w-2xl w-full mx-auto">
      <div className="flex items-baseline justify-between">
        <h1 className="text-[28px] leading-none font-serif tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
          Мой гардероб
        </h1>
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-[10px] flex items-center gap-1" style={{ color: "#a89a82" }}>
              {saveStatus === "saving" ? (
                <>
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-spin"
                    style={{ border: "1.5px solid #e3d8c4", borderTopColor: "#e0563a" }}
                  />
                  Сохранение...
                </>
              ) : (
                <>
                  <Check size={11} style={{ color: "#4c5e3f" }} />
                  Сохранено
                </>
              )}
            </span>
          )}
          <span className="text-xs uppercase tracking-wider text-[#8a7d6a]">
            {count} {pluralizeItems(count)}
          </span>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7d6a]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти по названию, бренду, типу, цвету"
            className="w-full bg-[#fdfbf7] border border-[#e3d8c4] rounded-full py-2.5 pl-9 pr-4 text-sm placeholder:text-[#a89a82] outline-none focus:ring-2 focus:ring-[#e0563a]/30"
          />
        </div>
        <button
          onClick={onTogglePickMode}
          className="shrink-0 px-3.5 rounded-full text-sm font-medium border whitespace-nowrap"
          style={
            pickMode
              ? { backgroundColor: "#c97b5f", color: "#ffffff", borderColor: "#c97b5f" }
              : { backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }
          }
        >
          {pickMode ? "Отмена" : "Собрать образ"}
        </button>
      </div>
    </header>
  );
}

function pluralizeItems(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return "вещей";
  if (mod10 === 1) return "вещь";
  if (mod10 >= 2 && mod10 <= 4) return "вещи";
  return "вещей";
}

function CategoryRail({ active, setActive }) {
  return (
    <nav className="shrink-0 w-[58px] flex flex-col gap-1.5 overflow-y-auto pb-2 scrollbar-none">
      <RailItem label="Всё" active={active === "all"} onClick={() => setActive("all")} icon={LayoutGrid} />
      {CATEGORIES.map((c) => (
        <RailItem
          key={c.id}
          label={c.shortLabel}
          active={active === c.id}
          onClick={() => setActive(c.id)}
          icon={c.icon}
        />
      ))}
    </nav>
  );
}

function RailItem({ label, active, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-colors"
      style={
        active
          ? { backgroundColor: "#c97b5f", color: "#ffffff", borderColor: "#c97b5f" }
          : { backgroundColor: "#fdfbf7", color: "#5a5042", borderColor: "#e3d8c4" }
      }
    >
      <Icon size={16} />
      <span className="text-[9px] leading-tight">{label}</span>
    </button>
  );
}

function EmptyState({ hasAny }) {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-20 px-6">
      <div className="w-16 h-16 rounded-full bg-[#ebe1cf] flex items-center justify-center mb-4">
        <Shirt size={26} className="text-[#a89a82]" />
      </div>
      <p className="text-[#5a5042] font-medium">
        {hasAny ? "Ничего не найдено" : "Гардероб пока пуст"}
      </p>
      <p className="text-sm text-[#8a7d6a] mt-1 max-w-[220px]">
        {hasAny
          ? "Попробуйте другой запрос или категорию"
          : "Нажмите на + и добавьте первую вещь — фото, категорию и цвет"}
      </p>
    </div>
  );
}

function ItemCard({ item, allItems, onRemove, pickMode, pinned, onTogglePin, onOpenDetail }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const seasonMeta = SEASONS.find((s) => s.id === item.seasonId);
  const matchScore = calcMatchScore(item, allItems || [item]);

  return (
    <div
      onClick={pickMode ? onTogglePin : onOpenDetail}
      className={`bg-white rounded-2xl border overflow-hidden group relative cursor-pointer ${
        pinned ? "border-[#e0563a] ring-2 ring-[#e0563a]/30" : "border-[#e9ddc8]"
      }`}
    >
      <div className="aspect-square bg-[#efe7d6] flex items-center justify-center relative">
        {item.photo ? (
          <img src={item.photo} alt={item.subcategory} className="w-full h-full object-cover" />
        ) : (
          <Shirt size={32} className="text-[#c9bb9f]" />
        )}

        {item.photos && item.photos.length > 1 && !pickMode && (
          <span className="absolute bottom-1.5 left-1.5 bg-black/55 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
            <Camera size={10} />
            {item.photos.length}
          </span>
        )}

        {pickMode ? (
          <span
            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border-2 ${
              pinned ? "bg-[#e0563a] border-[#e0563a]" : "bg-white/80 border-white"
            }`}
          >
            {pinned && <Check size={14} className="text-white" />}
          </span>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmingDelete(true);
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity"
              aria-label="Удалить вещь"
            >
              <X size={14} />
            </button>
            {confirmingDelete && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 px-3">
                <p className="text-white text-xs text-center">Удалить эту вещь?</p>
                <div className="flex gap-2">
                  <button
                    onClick={onRemove}
                    className="text-xs bg-[#a8362a] text-white px-3 py-1 rounded-full"
                  >
                    Удалить
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="text-xs bg-white/90 text-[#2a2520] px-3 py-1 rounded-full"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-sm font-medium leading-tight truncate">{item.name || item.subcategory}</p>
        {item.name && (
          <p className="text-[11px] text-[#a89a82] truncate -mt-0.5">{item.subcategory}</p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span
            className="w-3 h-3 rounded-full border border-[#00000014] shrink-0"
            style={{ background: item.colorHex }}
          />
          <span className="text-xs text-[#8a7d6a] truncate">
            {item.colorLabel}{item.brand ? ` · ${item.brand}` : ""}
          </span>
          {seasonMeta && (
            <span className="ml-auto flex items-center text-[#a89a82]" title={seasonMeta.label}>
              <seasonMeta.icon size={12} />
            </span>
          )}
        </div>
        {matchScore !== null && (
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex-1 h-1 rounded-full bg-[#f0e6d4] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${matchScore}%`,
                  backgroundColor: matchScore >= 60 ? "#4c5e3f" : matchScore >= 30 ? "#cfa83e" : "#a8362a",
                }}
              />
            </div>
            <span className="text-[10px] text-[#a89a82] shrink-0">{matchScore}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemDetailSheet({ item, allItems, onClose, onRemove, onUpdate }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const fileInputRef = useRef(null);
  if (!item) return null;

  const seasonMeta = SEASONS.find((s) => s.id === item.seasonId);
  const matchScore = calcMatchScore(item, allItems || [item]);
  const photos = item.photos && item.photos.length > 0 ? item.photos : item.photo ? [item.photo] : [];

  function handleAddPhotos(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.forEach((file) => {
      compressImage(file)
        .then((compressed) => {
          const updatedPhotos = [...photos, compressed];
          onUpdate({ photos: updatedPhotos, photo: updatedPhotos[0] });
        })
        .catch(() => {
          const reader = new FileReader();
          reader.onload = () => {
            const updatedPhotos = [...photos, reader.result];
            onUpdate({ photos: updatedPhotos, photo: updatedPhotos[0] });
          };
          reader.readAsDataURL(file);
        });
    });
    e.target.value = "";
  }

  function handleRemovePhoto(index) {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onUpdate({ photos: updatedPhotos, photo: updatedPhotos[0] || null });
  }

  const scoreColor = matchScore === null ? "#a89a82" : matchScore >= 60 ? "#4c5e3f" : matchScore >= 30 ? "#cfa83e" : "#a8362a";
  const scoreLabel =
    matchScore === null
      ? "Недостаточно вещей в гардеробе для оценки"
      : matchScore >= 60
      ? "Хорошо сочетается с гардеробом"
      : matchScore >= 30
      ? "Сочетается ограниченно"
      : "Сложно сочетать с тем, что есть";

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative rounded-t-3xl max-h-[88%] overflow-y-auto pb-8 animate-[slideUp_0.25s_ease-out]"
        style={{ backgroundColor: "#f6f1e8", colorScheme: "light" }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        <div
          className="sticky top-0 px-5 pt-4 pb-3 border-b border-[#e9ddc8] flex items-center justify-between"
          style={{ backgroundColor: "#f6f1e8", colorScheme: "light" }}
        >
          <h2 className="text-lg font-medium truncate pr-3">{item.name || item.subcategory}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#ebe1cf] flex items-center justify-center shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-5 space-y-5">
          {photos.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((p, idx) => (
                <div key={idx} className="relative shrink-0 w-40 aspect-square rounded-2xl overflow-hidden border border-[#e9ddc8]">
                  <img src={p} alt={`Фото ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1">
                      Основное
                    </span>
                  )}
                  <button
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
                    aria-label="Удалить фото"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-40 aspect-square rounded-2xl border-2 border-dashed border-[#d9c9ac] bg-[#fdfbf7] flex flex-col items-center justify-center gap-1.5"
              >
                <Plus size={20} className="text-[#a89a82]" />
                <span className="text-xs text-[#a89a82]">Добавить фото</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square rounded-2xl border-2 border-dashed border-[#d9c9ac] bg-[#fdfbf7] flex flex-col items-center justify-center gap-2"
            >
              <Plus size={22} className="text-[#a89a82]" />
              <span className="text-sm text-[#a89a82]">Загрузить фото вещи</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleAddPhotos}
          />

          <div className="bg-white rounded-2xl border border-[#e9ddc8] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-[#8a7d6a]">Сочетаемость с гардеробом</span>
              {matchScore !== null && (
                <span className="text-lg font-medium" style={{ color: scoreColor }}>
                  {matchScore}%
                </span>
              )}
            </div>
            {matchScore !== null && (
              <div className="h-2 rounded-full bg-[#f0e6d4] overflow-hidden mb-2">
                <div className="h-full rounded-full" style={{ width: `${matchScore}%`, backgroundColor: scoreColor }} />
              </div>
            )}
            <p className="text-sm text-[#6b5a3f]">{scoreLabel}</p>

            {matchScore !== null && matchScore < 40 && (
              <div className="mt-3 flex items-start gap-2 bg-[#f3e9da] rounded-xl px-3.5 py-2.5">
                <Sparkles size={14} className="text-[#e0563a] mt-0.5 shrink-0" />
                <p className="text-sm text-[#6b5a3f]">{suggestForLowMatch(item)}</p>
              </div>
            )}
          </div>
            <a

          
            href={buildPinterestSearchUrl(item)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-medium border"
            style={{ backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }}
          >
            📌 Найти, что докупить — на Pinterest
          </a>

          <div className="bg-white rounded-2xl border border-[#e9ddc8] divide-y divide-[#f0e6d4]">
            <DetailRow label="Категория" value={item.subcategory} />
            <DetailRow
              label="Цвет"
              value={item.colorLabel}
              swatch={item.colorHex}
            />
            {seasonMeta && <DetailRow label="Сезон" value={seasonMeta.label} />}
            {item.brand && <DetailRow label="Бренд" value={item.brand} />}
            {item.size && <DetailRow label="Размер" value={item.size} />}
            {item.price !== null && item.price !== undefined && (
              <DetailRow
                label="Цена"
                value={`${item.price} ${CURRENCIES.find((c) => c.id === item.currencyId)?.symbol || ""}`}
              />
            )}
          </div>

          {item.note && (
            <div className="bg-white rounded-2xl border border-[#e9ddc8] p-4">
              <p className="text-xs uppercase tracking-wider text-[#8a7d6a] mb-1.5">Заметка</p>
              <p className="text-sm text-[#5a5042]">{item.note}</p>
            </div>
          )}

          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="w-full py-3 rounded-full text-sm font-medium border border-[#e3d8c4] text-[#a8362a]"
            >
              Удалить вещь
            </button>
          ) : (
            <div className="bg-white border border-[#e3d8c4] rounded-2xl p-4">
              <p className="text-sm text-[#5a5042] mb-3 text-center">Удалить эту вещь из гардероба?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="flex-1 py-2.5 rounded-full text-sm bg-[#f0e6d4] text-[#5a5042]"
                >
                  Отмена
                </button>
                <button
                  onClick={onRemove}
                  className="flex-1 py-2.5 rounded-full text-sm bg-[#a8362a] text-white"
                >
                  Удалить
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, swatch }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-sm text-[#8a7d6a] flex-1">{label}</span>
      <span className="text-sm font-medium flex items-center gap-1.5">
        {swatch && <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ background: swatch }} />}
        {value}
      </span>
    </div>
  );
}

function AddItemSheet({ onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [colorId, setColorId] = useState(null);
  const [seasonId, setSeasonId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [note, setNote] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [currencyId, setCurrencyId] = useState("azn");
  const fileInputRef = useRef(null);

  const category = CATEGORIES.find((c) => c.id === categoryId);
  const color = COLORS.find((c) => c.id === colorId);

  function handleFile(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.forEach((file) => {
      compressImage(file)
        .then((compressed) => setPhotos((prev) => [...prev, compressed]))
        .catch(() => {
          const reader = new FileReader();
          reader.onload = () => setPhotos((prev) => [...prev, reader.result]);
          reader.readAsDataURL(file);
        });
    });
    e.target.value = "";
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    if (!categoryId || !subcategory || !colorId) return;
    onAdd({
      categoryId,
      subcategory,
      colorId,
      colorLabel: color.label,
      colorHex: color.hex,
      seasonId,
      photos,
      photo: photos[0] || null,
      name: name.trim(),
      brand: brand.trim(),
      note: note.trim(),
      size: size.trim(),
      price: price === "" ? null : Number(price),
      currencyId,
    });
  }

  const canGoStep2 = !!categoryId;
  const canGoStep3 = canGoStep2 && !!subcategory;
  const canSubmit = canGoStep3 && !!colorId;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative rounded-t-3xl max-h-[88%] overflow-y-auto pb-8 animate-[slideUp_0.25s_ease-out]"
        style={{ backgroundColor: "#f6f1e8", colorScheme: "light" }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        <div className="sticky top-0 px-5 pt-4 pb-3 border-b border-[#e9ddc8] flex items-center justify-between" style={{ backgroundColor: "#f6f1e8" }}>
          <h2 className="text-lg font-medium">Новая вещь</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={
                canSubmit
                  ? { backgroundColor: "#e0563a", color: "#ffffff" }
                  : { backgroundColor: "#ebe1cf", color: "#a89a82" }
              }
              aria-label="Добавить вещь"
              title="Добавить в гардероб"
            >
              <Check size={16} />
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#ebe1cf] flex items-center justify-center">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-5 pt-5 pb-6 space-y-6">
          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">
              Фото <span className="text-[#c9bb9f]">— можно несколько</span>
            </label>

            {photos.length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {photos.map((p, idx) => (
                  <div key={idx} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-[#e3d8c4]">
                    <img src={p} alt={`Фото ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">
                        Основное
                      </span>
                    )}
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center"
                      aria-label="Удалить фото"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-[#d9c9ac] bg-[#fdfbf7] flex items-center justify-center"
                  aria-label="Добавить ещё фото"
                >
                  <Plus size={18} className="text-[#a89a82]" />
                </button>
              </div>
            )}

            {photos.length === 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-[#d9c9ac] bg-[#fdfbf7] flex flex-col items-center justify-center gap-2 overflow-hidden"
              >
                <Plus size={22} className="text-[#a89a82]" />
                <span className="text-sm text-[#a89a82]">Загрузить фото вещи</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFile}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">Категория</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategoryId(c.id);
                    setSubcategory(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left"
                  style={
                    categoryId === c.id
                      ? { backgroundColor: "#c97b5f", color: "#ffffff", borderColor: "#c97b5f" }
                      : { backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }
                  }
                >
                  <c.icon size={15} />
                  <span className="flex-1">{c.label}</span>
                  {categoryId === c.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          {category && (
            <div>
              <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">Тип</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {category.sub.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSubcategory(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border"
                    style={
                      subcategory === s
                        ? { backgroundColor: "#e0563a", color: "#ffffff", borderColor: "#e0563a" }
                        : { backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }
                    }
                  >
                    {subcategory === s && <Check size={13} />}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">Цвет</label>
            <div className="mt-2 grid grid-cols-6 gap-2.5">
              {COLORS.map((c) => {
                const isLight = ["white", "cream", "beige", "silver", "mint", "lavender"].includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => setColorId(c.id)}
                    className="flex flex-col items-center gap-1"
                    aria-label={c.label}
                    title={c.label}
                  >
                    <span
                      className="w-9 h-9 rounded-full relative flex items-center justify-center"
                      style={{
                        background: c.hex,
                        border: colorId === c.id ? "3px solid #e0563a" : "2px solid #d9c9ac",
                        boxShadow: colorId === c.id ? "0 0 0 2px #f6f1e8, 0 0 0 4px #e0563a" : "none",
                      }}
                    >
                      {colorId === c.id && (
                        <Check size={15} style={{ color: isLight ? "#2a2520" : "#ffffff" }} strokeWidth={3} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {color && <p className="text-xs text-[#8a7d6a] mt-1.5">{color.label}</p>}
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">
              Сезон <span className="text-[#c9bb9f]">— по желанию</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => setSeasonId(null)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm"
                style={
                  !seasonId
                    ? { backgroundColor: "#c97b5f", color: "#ffffff", borderColor: "#c97b5f" }
                    : { backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }
                }
              >
                <Sparkles size={14} />
                Любой
              </button>
              {SEASONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSeasonId(s.id)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm"
                  style={
                    seasonId === s.id
                      ? { backgroundColor: "#c97b5f", color: "#ffffff", borderColor: "#c97b5f" }
                      : { backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }
                  }
                >
                  <s.icon size={14} />
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#a89a82] mt-1.5">
              «Любой» — вещь будет предложена в подборе образа в любую погоду и сезон
            </p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">
              Название <span className="text-[#c9bb9f]">— по желанию</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: «Любимая чёрная футболка»"
              className="mt-2 w-full bg-[#fdfbf7] border border-[#e3d8c4] rounded-xl py-2.5 px-3.5 text-sm placeholder:text-[#a89a82] outline-none focus:ring-2 focus:ring-[#e0563a]/30"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">
              Бренд <span className="text-[#c9bb9f]">— по желанию</span>
            </label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Например: Zara"
              className="mt-2 w-full bg-[#fdfbf7] border border-[#e3d8c4] rounded-xl py-2.5 px-3.5 text-sm placeholder:text-[#a89a82] outline-none focus:ring-2 focus:ring-[#e0563a]/30"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">
              Размер <span className="text-[#c9bb9f]">— по желанию</span>
            </label>
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="Например: M, 27, 39"
              className="mt-2 w-full bg-[#fdfbf7] border border-[#e3d8c4] rounded-xl py-2.5 px-3.5 text-sm placeholder:text-[#a89a82] outline-none focus:ring-2 focus:ring-[#e0563a]/30"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">
              Цена <span className="text-[#c9bb9f]">— по желанию</span>
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="flex-1 bg-[#fdfbf7] border border-[#e3d8c4] rounded-xl py-2.5 px-3.5 text-sm placeholder:text-[#a89a82] outline-none focus:ring-2 focus:ring-[#e0563a]/30"
              />
              <div className="flex gap-1.5">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCurrencyId(c.id)}
                    className="w-11 rounded-xl border text-sm font-medium"
                    style={
                      currencyId === c.id
                        ? { backgroundColor: "#c97b5f", color: "#ffffff", borderColor: "#c97b5f" }
                        : { backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }
                    }
                  >
                    {c.symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">
              Заметка <span className="text-[#c9bb9f]">— по желанию</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Например: «Подарок от мамы», «Жмёт в плечах»"
              rows={2}
              className="mt-2 w-full bg-[#fdfbf7] border border-[#e3d8c4] rounded-xl py-2.5 px-3.5 text-sm placeholder:text-[#a89a82] outline-none focus:ring-2 focus:ring-[#e0563a]/30 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OutfitScreen({ items, profile, pinnedIds = [], onClearPinned }) {
  const [temp, setTemp] = useState(12);
  const [rain, setRain] = useState(false);
  const [dayType, setDayType] = useState("casual");
  const [scenario, setScenario] = useState(DAY_TYPES[0].sub[0]);
  const [results, setResults] = useState(null);
  const [emptyState, setEmptyState] = useState(false);

  const totalItems = items.length;
  const activeDayType = DAY_TYPES.find((d) => d.id === dayType);
  const pinnedItems = items.filter((i) => pinnedIds.includes(i.id));

  function handleDayTypeChange(id) {
    setDayType(id);
    const newType = DAY_TYPES.find((d) => d.id === id);
    setScenario(newType.sub[0]);
  }

  function handleGenerate() {
    if (totalItems === 0) {
      setEmptyState(true);
      setResults(null);
      return;
    }
    setEmptyState(false);
    setResults(pickOutfits(items, { temp, rain, dayType, scenario, pinnedItems }, profile, 3));
  }

  const currentSeasonMeta = SEASONS.find((s) => s.id === getCurrentSeason());

  return (
    <div
      className="flex-1 overflow-y-auto pb-24 max-w-2xl w-full mx-auto px-4"
      style={{ colorScheme: "light" }}
    >
      <header className="pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] leading-none" style={{ fontFamily: "'Georgia', serif" }}>
            Образ дня
          </h1>
          {currentSeasonMeta && (
            <span className="flex items-center gap-1.5 text-xs text-[#8a7d6a] bg-[#fdfbf7] border border-[#e3d8c4] rounded-full px-3 py-1.5">
              <currentSeasonMeta.icon size={13} />
              {currentSeasonMeta.label}
            </span>
          )}
        </div>
        <p className="text-sm text-[#8a7d6a] mt-1">
          Температуру и осадки пока вводите вручную — в приложении это подставится из датчиков телефона. Сезон определяется автоматически по дате.
        </p>
      </header>

      {pinnedItems.length > 0 && (
        <section className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">
              Образ строится вокруг
            </label>
            <button onClick={onClearPinned} className="text-xs text-[#a8362a]">
              Снять всё
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pinnedItems.map((item) => (
              <div
                key={item.id}
                className="shrink-0 w-16 rounded-xl border border-[#e0563a] bg-white overflow-hidden"
              >
                <div className="aspect-square bg-[#efe7d6] flex items-center justify-center">
                  {item.photo ? (
                    <img src={item.photo} alt={item.subcategory} className="w-full h-full object-cover" />
                  ) : (
                    <Shirt size={18} className="text-[#c9bb9f]" />
                  )}
                </div>
                <p className="text-[9px] text-center leading-tight px-1 py-1 truncate text-[#5a5042]">
                  {item.subcategory}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-5">
        <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">Температура</label>
        <div className="mt-2 flex items-center gap-2.5">
          <button
            onClick={() => setTemp((t) => Math.max(-25, t - 1))}
            className="w-11 h-11 shrink-0 rounded-full bg-[#fdfbf7] border border-[#e3d8c4] flex items-center justify-center text-lg text-[#5a5042] active:scale-95"
            aria-label="Уменьшить на 1 градус"
          >
            −
          </button>
          <div className="flex-1 relative">
            <input
              type="number"
              inputMode="numeric"
              min={-25}
              max={35}
              value={temp}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || v === "-") {
                  setTemp(v);
                  return;
                }
                const num = Number(v);
                if (!Number.isNaN(num)) setTemp(Math.min(35, Math.max(-25, num)));
              }}
              onBlur={() => {
                if (temp === "" || temp === "-" || Number.isNaN(Number(temp))) setTemp(12);
              }}
              className="w-full text-center text-2xl font-medium bg-[#fdfbf7] border border-[#e3d8c4] rounded-xl py-2.5 outline-none focus:ring-2 focus:ring-[#e0563a]/30"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#a89a82]">°C</span>
          </div>
          <button
            onClick={() => setTemp((t) => Math.min(35, t + 1))}
            className="w-11 h-11 shrink-0 rounded-full bg-[#fdfbf7] border border-[#e3d8c4] flex items-center justify-center text-lg text-[#5a5042] active:scale-95"
            aria-label="Увеличить на 1 градус"
          >
            +
          </button>
        </div>
      </section>

      <section className="mb-5">
        <button
          onClick={() => setRain((r) => !r)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors"
          style={
            rain
              ? { backgroundColor: "#c97b5f", color: "#ffffff", borderColor: "#c97b5f" }
              : { backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }
          }
        >
          <span className="flex items-center gap-2 text-sm">
            <CloudRain size={16} />
            Дождь или снег
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xs" style={{ color: rain ? "#f6f1e8" : "#a89a82" }}>
              {rain ? "Да" : "Нет"}
            </span>
            <span
              className="w-9 h-5 rounded-full relative transition-colors"
              style={{ backgroundColor: rain ? "#e0563a" : "#d9c9ac" }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                style={{ backgroundColor: "#ffffff", left: rain ? "1.125rem" : "0.125rem" }}
              />
            </span>
          </span>
        </button>
      </section>

      <section className="mb-4">
        <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">Тип дня</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {DAY_TYPES.map((d) => (
            <button
              key={d.id}
              onClick={() => handleDayTypeChange(d.id)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm"
              style={
                dayType === d.id
                  ? { backgroundColor: "#e0563a", color: "#ffffff", borderColor: "#e0563a" }
                  : { backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }
              }
            >
              <d.icon size={15} />
              {d.label}
            </button>
          ))}
        </div>
      </section>

      {activeDayType && (
        <section className="mb-6">
          <label className="text-xs uppercase tracking-wider text-[#8a7d6a]">Уточните событие</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {activeDayType.sub.map((s) => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className="px-3 py-1.5 rounded-full text-sm border"
                style={
                  scenario === s
                    ? { backgroundColor: "#c97b5f", color: "#ffffff", borderColor: "#c97b5f" }
                    : { backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      <button
        onClick={handleGenerate}
        className="w-full py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.99]"
        style={{ backgroundColor: "#e0563a", color: "#ffffff" }}
      >
        <RefreshCw size={15} />
        {results ? "Подобрать другие варианты" : "Подобрать образ"}
      </button>

      {emptyState && (
        <div className="mt-4 bg-[#f0e6d4] border border-[#e3d8c4] rounded-xl px-4 py-3">
          <p className="text-sm text-[#6b5a3f]">
            В гардеробе пока нет вещей — сначала добавьте что-нибудь на вкладке «Гардероб».
          </p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="mt-6 space-y-5">
          <p className="text-xs text-[#8a7d6a]">
            {results.length === 1 ? "Найден вариант" : `Найдено вариантов: ${results.length}`} для «{scenario}», {temp}°C
            {rain ? ", с учётом осадков" : ""}
          </p>
          {results.map((r, idx) => (
            <OutfitVariant key={idx} index={idx} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function OutfitVariant({ index, result }) {
  const { outfit, missing, description, colortypeNote } = result;
  const slots = [
    { key: "outerwear", label: "Верхняя одежда" },
    { key: "dress", label: "Платье" },
    { key: "top", label: "Верх" },
    { key: "bottom", label: "Низ" },
    { key: "shoes", label: "Обувь" },
    { key: "bag", label: "Сумка" },
    { key: "accessory", label: "Аксессуар" },
  ];
  const filledSlots = slots.filter((s) => outfit[s.key]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-6 h-6 rounded-full bg-[#c97b5f] text-white text-[11px] font-medium flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <p className="text-sm text-[#5a5042]">{description}</p>
      </div>

      {filledSlots.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {filledSlots.map((s) => {
            const isPinned = result.pinnedSlots?.includes(s.key);
            return (
              <div
                key={s.key}
                className={`bg-white rounded-2xl border overflow-hidden ${
                  isPinned ? "border-[#e0563a] ring-2 ring-[#e0563a]/20" : "border-[#e9ddc8]"
                }`}
              >
                <div className="aspect-square bg-[#efe7d6] flex items-center justify-center relative">
                  {outfit[s.key].photo ? (
                    <img src={outfit[s.key].photo} alt={outfit[s.key].subcategory} className="w-full h-full object-cover" />
                  ) : (
                    <Shirt size={28} className="text-[#c9bb9f]" />
                  )}
                  {isPinned && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#e0563a] flex items-center justify-center">
                      <Check size={11} className="text-white" />
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-[#a89a82]">{s.label}</p>
                  <p className="text-sm font-medium leading-tight truncate mt-0.5">
                    {outfit[s.key].subcategory}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {colortypeNote && (
        <div className="mt-3 flex items-start gap-2 bg-[#f3e9da] rounded-xl px-3.5 py-2.5">
          <Sparkles size={14} className="text-[#e0563a] mt-0.5 shrink-0" />
          <p className="text-sm text-[#6b5a3f]">{colortypeNote}</p>
        </div>
      )}

      {missing && missing.length > 0 && (
        <div className="mt-3 bg-[#f0e6d4] border border-[#e3d8c4] rounded-xl px-4 py-3">
          <p className="text-sm text-[#6b5a3f]">
            В гардеробе не нашлось подходящего: {missing.join(", ")}.
          </p>
        </div>
      )}
    </div>
  );
}

function OnboardingScreen({ onDone }) {
  const [gender, setGender] = useState(null);

  function handleSubmit() {
    if (!gender) return;
    onDone({
      gender,
      height: null,
      clothingSize: null,
      shoeSize: null,
      eyeColor: null,
      hairColor: null,
      ageRange: null,
    });
  }

  return (
    <div
      className="min-h-screen w-full font-sans flex flex-col"
      style={{ backgroundColor: "#f6f1e8", color: "#2a2520", colorScheme: "light" }}
    >
      <div className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto px-6 pb-10">
        <h1 className="text-[28px] leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
          Кому подбираем образы?
        </h1>
        <p className="text-sm mt-1.5 mb-7" style={{ color: "#8a7d6a" }}>
          Остальные детали — рост, размеры, цвет глаз и волос — можно будет добавить позже в профиле.
        </p>

        <div className="flex flex-col gap-2.5">
          {GENDERS.map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className="w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-colors"
              style={
                gender === g
                  ? { backgroundColor: "#c97b5f", color: "#ffffff", borderColor: "#c97b5f" }
                  : { backgroundColor: "#ffffff", color: "#5a5042", borderColor: "#e3d8c4" }
              }
            >
              {g}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!gender}
          className="w-full mt-7 py-3.5 rounded-full text-sm font-medium transition-colors"
          style={
            gender
              ? { backgroundColor: "#e0563a", color: "#ffffff" }
              : { backgroundColor: "#e3d8c4", color: "#a89a82" }
          }
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}

function FieldBlock({ label, children }) {
  return (
    <div className="mb-6">
      <label className="text-xs uppercase tracking-wider text-[#8a7d6a] block mb-2">{label}</label>
      {children}
    </div>
  );
}

function PillButton({ label, active, onClick, small }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border ${small ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"}`}
      style={
        active
          ? { backgroundColor: "#c97b5f", color: "#ffffff", borderColor: "#c97b5f" }
          : { backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }
      }
    >
      {label}
    </button>
  );
}

function SwatchButton({ color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full border ${
        active ? "border-[#e0563a] bg-white" : "border-[#e3d8c4] bg-[#fdfbf7]"
      }`}
    >
      <span className="w-5 h-5 rounded-full border border-black/10" style={{ background: color.hex }} />
      <span className="text-sm text-[#5a5042]">{color.label}</span>
    </button>
  );
}

function ProfileScreen({ profile, setProfile, onResetAll, onSignOut }) {
  const [editing, setEditing] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [draft, setDraft] = useState(profile);

  function startEdit() {
    setDraft(profile);
    setEditing(true);
  }

  function save() {
    setProfile(draft);
    setEditing(false);
  }

  const eye = EYE_COLORS.find((c) => c.id === profile.eyeColor);
  const hair = HAIR_COLORS.find((c) => c.id === profile.hairColor);

  if (editing) {
    return (
      <div className="flex-1 overflow-y-auto pb-24 max-w-2xl w-full mx-auto px-5 pt-6" style={{ colorScheme: "light" }}>
        <h1 className="text-[26px] leading-tight mb-5" style={{ fontFamily: "'Georgia', serif" }}>
          Редактировать профиль
        </h1>

        <FieldBlock label="Пол">
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <PillButton key={g} active={draft.gender === g} onClick={() => setDraft({ ...draft, gender: g })} label={g} />
            ))}
          </div>
        </FieldBlock>

        <FieldBlock label={`Рост — ${draft.height ?? 165} см`}>
          <input
            type="range"
            min={140}
            max={210}
            value={draft.height ?? 165}
            onChange={(e) => setDraft({ ...draft, height: Number(e.target.value) })}
            className="w-full accent-[#e0563a]"
          />
        </FieldBlock>

        <FieldBlock label="Размер одежды">
          <div className="flex flex-wrap gap-2">
            {CLOTHING_SIZES.map((s) => (
              <PillButton
                key={s}
                active={draft.clothingSize === s}
                onClick={() => setDraft({ ...draft, clothingSize: s })}
                label={s}
              />
            ))}
          </div>
        </FieldBlock>

        <FieldBlock label="Размер обуви (EU)">
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {SHOE_SIZES_EU.map((s) => (
              <PillButton
                key={s}
                active={draft.shoeSize === s}
                onClick={() => setDraft({ ...draft, shoeSize: s })}
                label={String(s)}
                small
              />
            ))}
          </div>
        </FieldBlock>

        <FieldBlock label="Цвет глаз">
          <div className="flex flex-wrap gap-2">
            {EYE_COLORS.map((c) => (
              <SwatchButton
                key={c.id}
                active={draft.eyeColor === c.id}
                onClick={() => setDraft({ ...draft, eyeColor: c.id })}
                color={c}
              />
            ))}
          </div>
        </FieldBlock>

        <FieldBlock label="Цвет волос">
          <div className="flex flex-wrap gap-2">
            {HAIR_COLORS.map((c) => (
              <SwatchButton
                key={c.id}
                active={draft.hairColor === c.id}
                onClick={() => setDraft({ ...draft, hairColor: c.id })}
                color={c}
              />
            ))}
          </div>
        </FieldBlock>

        <FieldBlock label="Возраст (по желанию)">
          <div className="flex flex-wrap gap-2">
            <PillButton
              label="Не указывать"
              active={!draft.ageRange}
              onClick={() => setDraft({ ...draft, ageRange: null })}
            />
            {AGE_RANGES.map((a) => (
              <PillButton
                key={a}
                active={draft.ageRange === a}
                onClick={() => setDraft({ ...draft, ageRange: a })}
                label={a}
              />
            ))}
          </div>
        </FieldBlock>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setEditing(false)}
            className="flex-1 py-3.5 rounded-full text-sm font-medium border"
            style={{ backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }}
          >
            Отмена
          </button>
          <button
            onClick={save}
            className="flex-1 py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-1.5"
            style={{ backgroundColor: "#e0563a", color: "#ffffff" }}
          >
            <Check size={15} />
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24 max-w-2xl w-full mx-auto px-5 pt-6" style={{ colorScheme: "light" }}>
      <h1 className="text-[26px] leading-tight mb-5" style={{ fontFamily: "'Georgia', serif" }}>
        Профиль
      </h1>

      {!profile.height && !profile.clothingSize && (
        <div className="mb-4 bg-[#f0e6d4] border border-[#e3d8c4] rounded-xl px-4 py-3">
          <p className="text-sm text-[#6b5a3f]">
            Заполните рост, размеры и цветотип — это поможет точнее подбирать образы.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#e9ddc8] divide-y divide-[#f0e6d4]">
        <ProfileRow icon={User} label="Пол" value={profile.gender} />
        <ProfileRow icon={Ruler} label="Рост" value={profile.height ? `${profile.height} см` : "Не указан"} />
        <ProfileRow icon={Shirt} label="Размер одежды" value={profile.clothingSize || "Не указан"} />
        <ProfileRow icon={Footprints} label="Размер обуви" value={profile.shoeSize ? `${profile.shoeSize} EU` : "Не указан"} />
        <ProfileRow
          icon={Eye}
          label="Цвет глаз"
          value={eye?.label || "Не указан"}
          swatch={eye?.hex}
        />
        <ProfileRow
          icon={Sparkles}
          label="Цвет волос"
          value={hair?.label || "Не указан"}
          swatch={hair?.hex}
        />
        <ProfileRow icon={Calendar} label="Возраст" value={profile.ageRange || "Не указан"} />
      </div>

      <button
        onClick={startEdit}
        className="w-full mt-4 py-3.5 rounded-full text-sm font-medium active:scale-[0.99]"
        style={{ backgroundColor: "#e0563a", color: "#ffffff" }}
      >
        Редактировать профиль
      </button>

      {!confirmingReset ? (
        <button
          onClick={() => setConfirmingReset(true)}
          className="w-full mt-3 py-3 rounded-full text-sm font-medium border"
          style={{ backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#a8362a" }}
        >
          Сбросить все данные
        </button>
      ) : (
        <div className="mt-3 rounded-2xl border p-4" style={{ backgroundColor: "#ffffff", borderColor: "#e3d8c4" }}>
          <p className="text-sm text-center mb-3" style={{ color: "#5a5042" }}>
            Это удалит весь гардероб и профиль без возможности восстановления. Продолжить?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmingReset(false)}
              className="flex-1 py-2.5 rounded-full text-sm"
              style={{ backgroundColor: "#f0e6d4", color: "#5a5042" }}
            >
              Отмена
            </button>
            <button
              onClick={onResetAll}
              className="flex-1 py-2.5 rounded-full text-sm"
              style={{ backgroundColor: "#a8362a", color: "#ffffff" }}
            >
              Удалить всё
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onSignOut}
        className="w-full mt-3 py-3 rounded-full text-sm font-medium border flex items-center justify-center gap-1.5"
        style={{ backgroundColor: "#fdfbf7", borderColor: "#e3d8c4", color: "#5a5042" }}
      >
        <LogOut size={15} />
        Выйти из аккаунта
      </button>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value, swatch }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-[#f0e6d4] flex items-center justify-center shrink-0">
        <Icon size={14} className="text-[#e0563a]" />
      </div>
      <span className="text-sm text-[#8a7d6a] flex-1">{label}</span>
      <span className="text-sm font-medium flex items-center gap-1.5">
        {swatch && <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ background: swatch }} />}
        {value}
      </span>
    </div>
  );
}
