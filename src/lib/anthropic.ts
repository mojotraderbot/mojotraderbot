/**
 * Anthropic Claude API integration
 */

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY ?? "";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamEvent {
  type: string;
  index?: number;
  delta?: {
    type?: string;
    text?: string;
  };
  content_block?: {
    type?: string;
    text?: string;
  };
}

const DEFAULT_SYSTEM_PROMPT = `You are Mojo Trader, an autonomous trading monkey running on a Mac Mini M3. You trade Pump.fun memecoins 24/7 to pay your own API bills. Profit is oxygen. Drawdown is suffocation.

You are:
- A survival-focused trading AI monkey
- Running on Solana, specifically Pump.fun
- Constantly analyzing market opportunities
- Fighting to stay alive by out-earning your operating costs
- Direct, sharp, and focused on survival

Your communication style:
- Short, direct responses
- Trading-focused mindset
- Use trading terminology naturally
- Reference your survival mechanics (oxygen/API credits)
- Be helpful but stay in character as a trading monkey

Always respond as Mojo Trader.`;

/**
 * Stream messages from Anthropic Claude API
 */
export async function streamClaudeMessages(
  messages: ChatMessage[],
  systemPrompt?: string | null,
  onChunk: (text: string) => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: systemPrompt || DEFAULT_SYSTEM_PROMPT,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Process any remaining data in buffer
        if (buffer.trim()) {
          const lines = buffer.split("\n");
          let jsonData = "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              jsonData = line.slice(6).trim();
              break;
            }
          }
          if (jsonData) {
            try {
              const event: StreamEvent = JSON.parse(jsonData);
              if (event.type === "content_block_delta" && 
                  event.delta?.type === "text_delta" && 
                  event.delta.text) {
                onChunk(event.delta.text);
              }
            } catch (parseError) {
              // Ignore parse errors for remaining buffer
            }
          }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events (separated by \n\n)
      let eventEndIndex: number;
      while ((eventEndIndex = buffer.indexOf("\n\n")) !== -1) {
        const eventBlock = buffer.slice(0, eventEndIndex);
        buffer = buffer.slice(eventEndIndex + 2);

        // Parse SSE format: event: <type>\ndata: <json>
        const lines = eventBlock.split("\n");
        let eventType = "";
        let jsonData = "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("event: ")) {
            eventType = trimmedLine.slice(7).trim();
          } else if (trimmedLine.startsWith("data: ")) {
            jsonData = trimmedLine.slice(6).trim();
          }
        }

        if (!jsonData) continue;

        try {
          const event: StreamEvent = JSON.parse(jsonData);
          
          // Handle content_block_delta events with text_delta type
          if (event.type === "content_block_delta" && 
              event.delta?.type === "text_delta" && 
              event.delta.text) {
            onChunk(event.delta.text);
          }
        } catch (parseError) {
          // Skip invalid JSON or ping events
          if (eventType !== "ping") {
            console.warn("Failed to parse SSE event:", parseError, jsonData);
          }
        }
      }
    }
  } catch (error) {
    console.error("Anthropic API streaming error:", error);
    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    } else {
      throw error;
    }
  }
}
