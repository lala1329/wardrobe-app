// Серверная функция Vercel: распознаёт категорию, тип и цвет вещи по фото через Claude API.
// Ключ ANTHROPIC_API_KEY хранится в Environment Variables проекта на Vercel — он никогда
// не попадает в браузер пользователя, запрос идёт только с сервера.
//
// Базовая версия: категория + подкатегория + цвет (один). Без сезона/принта/фасона —
// это будет добавлено отдельно на следующем этапе.

const CATEGORY_IDS = ["tops", "bottoms", "dresses", "outerwear", "shoes", "bags", "accessories"];

const SUBCATEGORIES_BY_CATEGORY = {
  tops: ["Футболка", "Рубашка", "Блузка", "Водолазка", "Лонгслив", "Свитер / джемпер", "Жилет"],
  bottoms: ["Джинсы", "Брюки", "Юбка", "Шорты", "Легинсы", "Спортивные брюки"],
  dresses: ["Платье", "Комбинезон"],
  outerwear: [
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
  "burgundy", "pink", "purple", "lavender", "silver", "multi",
];

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

  const { imageBase64, mediaType } = req.body || {};
  if (!imageBase64 || !mediaType) {
    res.status(400).json({ error: "Не передано изображение" });
    return;
  }

  const allSubcategories = Object.entries(SUBCATEGORIES_BY_CATEGORY)
    .map(([cat, subs]) => `${cat}: ${subs.join(", ")}`)
    .join("\n");

  const systemPrompt = `Ты помогаешь распознать предмет одежды на фото для приложения "Мой гардероб".
Тебе нужно определить категорию, подкатегорию (тип) и основной цвет вещи.

Допустимые категории и их подкатегории:
${allSubcategories}

Допустимые цвета (id): ${COLOR_IDS.join(", ")}

Правила:
- Если подкатегория или цвет вещи НЕ соответствуют точно ни одному варианту из списков выше — не выбирай ближайший силой, а укажи suggestedNew с понятным русским названием того, что ты реально видишь.
- Отвечай ТОЛЬКО валидным JSON, без markdown-разметки, без преамбулы, без комментариев.
- Формат ответа:
{
  "categoryId": "одно из: tops, bottoms, dresses, outerwear, shoes, bags, accessories",
  "subcategory": "точное значение из списка подкатегорий ИЛИ null, если не подходит",
  "suggestedNewSubcategory": "название на русском, если subcategory выше null, иначе null",
  "colorId": "одно из допустимых color id ИЛИ null, если не подходит",
  "suggestedNewColorLabel": "название цвета на русском, если colorId выше null, иначе null",
  "confidence": "high | medium | low"
}`;

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
        max_tokens: 400,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: imageBase64 },
              },
              {
                type: "text",
                text: "Распознай эту вещь по правилам выше и ответь только JSON.",
              },
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

    // Базовая проверка на всякий случай — не доверяем AI вслепую
    if (parsed.categoryId && !CATEGORY_IDS.includes(parsed.categoryId)) parsed.categoryId = null;
    if (parsed.colorId && !COLOR_IDS.includes(parsed.colorId)) parsed.colorId = null;

    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: "Внутренняя ошибка распознавания", details: String(e) });
  }
}
