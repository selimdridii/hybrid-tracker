import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  const { description } = await request.json();
  if (!description?.trim()) {
    return Response.json({ error: "No description provided" }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Estimate the nutritional content for this meal: "${description}"

Respond with ONLY a JSON object (no markdown, no explanation):
{"calories": <number>, "protein": <number>, "carbs": <number>, "fat": <number>}

All values should be integers. Calories in kcal, macros in grams.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    const macros = JSON.parse(text.trim());
    return Response.json(macros);
  } catch {
    return Response.json({ error: "Failed to parse response" }, { status: 500 });
  }
}
