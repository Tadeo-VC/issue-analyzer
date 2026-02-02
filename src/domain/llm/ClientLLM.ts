import { Message } from "../message";
import { GenerateResult } from "./GenerateResult";

export interface ClientLLM {
  generateResponse(message: Message): Promise<GenerateResult>;
  receiveToolResponse?(result: string): void;
}
