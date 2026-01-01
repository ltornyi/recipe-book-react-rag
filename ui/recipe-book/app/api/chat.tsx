export type ChatRole = "user" | "assistant" | "system";

export type ChatSource = {
  recipe_id: number;
  title: string;
};

export type ChatMessage = {
  role: ChatRole;
  content: string;
  sources?: ChatSource[];
};

const mapToConversation = (history: ChatMessage[]) =>
  history.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

export async function reformulateUserMessage(
  userMessage: string,
  history: ChatMessage[]
): Promise<string> {
  const resp = await fetch("/api/chat/reformulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessage, conversation: mapToConversation(history)}),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Reformulate request failed: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  return data.reformulatedQuestion;
}

export async function sendChatMessage(
  reformulatedUserMessage: string,
  history: ChatMessage[]
): Promise<ChatMessage> {
  const resp = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessage: reformulatedUserMessage, conversation: mapToConversation(history)}),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Chat request failed: ${resp.status} ${text}`);
  }

  const data: { answer: string; sources: { id: string; title: string }[] } = await resp.json();
  return {
    role: "assistant",
    content: data.answer ?? "",
    sources: (data.sources ?? []).map(source => ({
      recipe_id: parseInt(source.id),
      title: source.title,
    }))
  };
}

export async function handleUserMessage(
  userMessage: string,
  history: ChatMessage[]
): Promise<{ reformulatedUserMessage: ChatMessage; assistantMessage: ChatMessage }> {
  const reformulated = await reformulateUserMessage(userMessage, history);
  console.log("Reformulated question:", reformulated);
  const assistantMessage = await sendChatMessage(reformulated, history);
  console.log("Assistant message:", assistantMessage);
  return {
    reformulatedUserMessage: {
      role: "user",
      content: reformulated,
    },
    assistantMessage,
  };
}