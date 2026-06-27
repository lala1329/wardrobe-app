// Серверная функция Vercel: распознаёт предметы одежды на фото через Claude API.
// Ключ ANTHROPIC_API_KEY хранится в Environment Variables проекта на Vercel — он никогда
// не попадает в браузер пользователя, запрос идёт только с сервера.
//
// Может вернуть ОДНУ вещь или СПИСОК вещей, если на фото несколько предметов одежды
// (например кофта + леггинсы + кроссовки на одном фото с человеком).

const CATEGORY_IDS = ["tops", "bottoms", "dresses", "outerwear", "shoes", "bags", "accessories"];

const SUBCATEGORIES_BY_CATEGORY = {
  tops: ["Футболка", "Майка / топ", "Рубашка", "Блузка", "Водолазка", "Лонгслив", "Свитер / джемпер", "Жилет"],
  bottoms: ["Джинсы", "Брюки", "Кожаные брюки", "Юбка", "Шорты", "Легинсы", "Спортивные брюки"],
  dresses: ["Платье", "Комбинезон"],
  outerwear: [
    "Куртка",
    "Джинсовая куртка",
    "Пиджак",
    "Жакет",
    "Кардиган",
    "Накидка",
    "Утеплённый жилет",
    "Пальто",
    "Плащ",
    "Пуховик",
  ],
  shoes: [
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
  bags: ["Рюкзак", "Клатч", "Сумка через плечо", "Тоут"],
  accessories: ["Украшения", "Шарф", "Шапка", "Перчатки", "Пояс", "Очки"],
};

const COLOR_IDS = [
  "black", "white", "cream", "beige", "gray", "graphite", "brown", "camel", "khaki", "olive",
  "navy", "blue", "denim", "turquoise", "mint", "green", "yellow", "gold", "orange", "red",
  "burgundy", "pink", "purple", "lavender", "silver", "leopard", "multi",
];

const SEASON_IDS = ["winter", "demi", "summer"];
const SILHOUETTE_IDS = ["fitted", "loose", "oversized", "regular"];
const LENGTH_IDS = ["mini", "midi", "maxi", "short", "long", "regular"];
const STYLE_IDS = ["casual", "classic", "romantic", "sporty", "business"];

function buildSystemPrompt() {
  const allSubcategories = Object.entries(SUBCATEGORIES_BY_CATEGORY)
    .map(([cat, subs]) => `${cat}: ${subs.join(", ")}`)
    .join("\n");

  return `Ты помогаешь распознать предметы одежды на фото для приложения "Мой гардероб".
На фото может быть ОДНА вещь, либо ЧЕЛОВЕК, на котором надето НЕСКОЛЬКО разных вещей
(например кофта + леггинсы + кроссовки одновременно). Найди КАЖДЫЙ отдельный предмет одежды,
который чётко виден на фото, и опиши каждый отдельно.

Допустимые категории и их подкатегории:
${allSubcategories}

Допустимые цвета (id): ${COLOR_IDS.join(", ")}
Допустимые сезоны/уровни теплоты (seasonId): winter (тёплая, зимняя вещь), demi (умеренная, межсезонная), summer (лёгкая, летняя вещь)
Допустимые силуэты (silhouetteId): fitted (облегающий), loose (свободный), oversized (оверсайз), regular (обычный)
Допустимая длина/пропорции (lengthId): mini, midi, maxi, short, long, regular — выбери то, что применимо к типу вещи (для платьев/юбок mini/midi/maxi, для верха short/regular/long, для остального regular)
Допустимый стиль (styleId): casual (повседневный), classic (классический/строгий), romantic (романтичный), sporty (спортивный), business (деловой)

Правила:
- Подкатегорию выбирай ТОЛЬКО если она точно описывает вещь по крою/конструкции — не выбирай "похожий" вариант, если он на самом деле другой. Например: майка или топ на тонких бретельках без рукавов — это "Майка / топ", а НЕ "Футболка" (у футболки есть хотя бы короткие рукава); если в списке нет подходящего варианта — используй suggestedNewSubcategory, а subcategory оставь null.
- "Водолазка" определяется ПО ВОРОТУ (высокий ворот, плотно облегающий шею, "под горло"), а НЕ по длине рукава — водолазка может быть и с коротким рукавом. Если на вещи высокий обтягивающий ворот — это "Водолазка", даже если рукав короткий. "Футболка" — это обычный круглый или V-образный вырез без высокого ворота. Это правило применяй строго и одинаково на каждом запросе.
- Материал брюк проверяй внимательно по фактуре на фото: гладкая, блестящая или с характерным глянцевым отливом поверхность — это "Кожаные брюки", а не обычные "Брюки" и не "Спортивные брюки". "Спортивные брюки" — это только мягкий трикотаж/флис спортивного кроя (с резинкой или манжетами на штанинах).
- Цвета определяй внимательно: "Коричневый" — это тёплый землистый оттенок без красного подтона; "Бордовый" — это тёмный винно-красный с явным красным/розовым подтоном. Если у тебя сомнение между ними — присмотрись к подтону: розоватый/красноватый блеск означает бордовый, землистый без красного — коричневый.
- Если на вещи именно леопардовый принт (пятна на бежевом/рыжеватом фоне, как окрас леопарда) — используй colorId: "leopard" напрямую, это отдельный цвет в списке. Для leopard поле patternColorIds можно оставить пустым [] — сам принт уже описан через colorId.
- Если на вещи другой принт/узор (горошек, цветы, клетка, полоска, зебра и т.п., НЕ леопардовый) — заполни поле "patternColorIds" списком цветов узора, а colorId укажи как основной фоновый цвет. Пример: вещь в горошек → colorId: "white", patternColorIds: ["black"].
- То же самое для цвета в целом: если основной цвет вещи НЕ соответствует точно ни одному варианту из списка цветов — укажи suggestedNewColorLabel, а colorId оставь null. Не подбирай ближайший цвет силой.
- Если вещь полностью однотонная, без какого-либо узора — patternColorIds оставь пустым массивом [].
- seasonId, silhouetteId, lengthId, styleId — оцени по тому, что видно на фото (плотность ткани, рукава, посадка, общее настроение вещи). Если оценить невозможно — поставь null, не угадывай вслепую.
- Для кроссовок и кед особенно внимательно определяй styleId: массивная, объёмная подошва, заметные технологичные детали, надписи/логотипы спортивных брендов на самой обуви — это явно "sporty". Минималистичные, тонкие, гладкие кроссовки без массивной подошвы — это "casual", их можно сочетать с платьями и более собранными образами. Не ставь styleId: null для обуви только потому, что трудно решить — выбери наиболее вероятный вариант между sporty и casual по общему виду подошвы и силуэта.
- Распознавание должно работать стабильно и одинаково при каждом запросе для одного и того же фото — не меняй вывод случайным образом, основывайся строго на видимых деталях.
- Не придумывай вещи, которых не видно на фото. Не дублируй одну и ту же вещь дважды.
- Отвечай ТОЛЬКО валидным JSON, без markdown-разметки, без преамбулы, без комментариев.
- Формат ответа — ВСЕГДА массив объектов, даже если найдена только одна вещь:
[
  {
    "itemLabel": "короткое название на русском для показа в списке, например «Леггинсы чёрные»",
    "categoryId": "одно из: tops, bottoms, dresses, outerwear, shoes, bags, accessories",
    "subcategory": "точное значение из списка подкатегорий ИЛИ null, если не подходит",
    "suggestedNewSubcategory": "название на русском, если subcategory выше null, иначе null",
    "colorId": "одно из допустимых color id ИЛИ null, если не подходит",
    "suggestedNewColorLabel": "название цвета на русском, если colorId выше null, иначе null",
    "patternColorIds": ["список цветов узора, если есть принт (кроме leopard), иначе []"],
    "seasonId": "winter | demi | summer | null",
    "silhouetteId": "fitted | loose | oversized | regular | null",
    "lengthId": "mini | midi | maxi | short | long | regular | null",
    "styleId": "casual | classic | romantic | sporty | business | null",
    "confidence": "high | medium | low"
  }
]`;
}

function sanitizeItem(item) {
  const safe = { ...item };
  if (safe.categoryId && !CATEGORY_IDS.includes(safe.categoryId)) safe.categoryId = null;
  if (safe.colorId && !COLOR_IDS.includes(safe.colorId)) safe.colorId = null;
  if (safe.seasonId && !SEASON_IDS.includes(safe.seasonId)) safe.seasonId = null;
  if (safe.silhouetteId && !SILHOUETTE_IDS.includes(safe.silhouetteId)) safe.silhouetteId = null;
  if (safe.lengthId && !LENGTH_IDS.includes(safe.lengthId)) safe.lengthId = null;
  if (safe.styleId && !STYLE_IDS.includes(safe.styleId)) safe.styleId = null;
  if (Array.isArray(safe.patternColorIds)) {
    safe.patternColorIds = safe.patternColorIds.filter((c) => COLOR_IDS.includes(c));
  } else {
    safe.patternColorIds = [];
  }
  if (!safe.itemLabel) safe.itemLabel = safe.subcategory || safe.suggestedNewSubcategory || "Вещь";
  return safe;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Метод не поддерживается" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "AI-распознавание временно недоступно (нет ключа на сервере)" });
    return;
  }

  const { imageBase64, mediaType, focusHint } = req.body || {};
  if (!imageBase64 || !mediaType) {
    res.status(400).json({ error: "Не передано изображение" });
    return;
  }

  // focusHint — необязательная подсказка: "сосредоточься именно на леггинсах",
  // используется при повторном, уточняющем распознавании уже выбранной вещи из списка.
  const userText = focusHint
    ? `На фото несколько вещей. Сосредоточься ТОЛЬКО на этой: "${focusHint}". Опиши именно её, в формате массива из одного объекта.`
    : "Найди все отдельные предметы одежды на фото и опиши каждый по правилам выше. Ответь только JSON-массивом.";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1200,
        system: buildSystemPrompt(),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: imageBase64 },
              },
              { type: "text", text: userText },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: "Ошибка при обращении к AI", details: errText });
      return;
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((c) => c.type === "text");
    if (!textBlock) {
      res.status(502).json({ error: "AI не вернул текстовый ответ" });
      return;
    }

    let parsed;
    try {
      const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      res.status(502).json({ error: "Не удалось разобрать ответ AI", raw: textBlock.text });
      return;
    }

    // На случай, если AI всё же вернул один объект, а не массив — оборачиваем сами
    const itemsArray = Array.isArray(parsed) ? parsed : [parsed];
    const sanitized = itemsArray.map(sanitizeItem);

    res.status(200).json({ items: sanitized });
  } catch (e) {
    res.status(500).json({ error: "Внутренняя ошибка распознавания", details: String(e) });
  }
}
