import type { Message } from "./message";

export interface ClientLLM {
  generateResponse(message: Message): Promise<string>;
  receiveToolResponse?(result: string): void;
}
