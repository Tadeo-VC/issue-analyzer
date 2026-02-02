import { Message } from "../Message";
import { GenerateResult } from "./GenerateResult";

export interface ClientLLM {
  generateResponse(message: Message): Promise<GenerateResult>;
  receiveToolResponse?(result: string): void;
}
