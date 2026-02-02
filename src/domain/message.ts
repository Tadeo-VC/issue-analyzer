import { Agent } from "./agent";

export class Message {
  private request: string;
  private response?: string;
  private responseState: ResponseState = ResponseState.IDLE;

  constructor(request: string) {
    this.request = request;
  }

  async sendMessage(agent: Agent){
    this.response = await agent.receiveMessage(this);
  }

  receiveResponse(response: string){
    this.response = response;
    this.responseState = ResponseState.SUCCESS;
  }
}