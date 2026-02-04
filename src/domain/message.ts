import { ResponseState } from "./ResponseState";

export class Message {
  private request: string;
  private response?: string;
  private responseState: ResponseState = ResponseState.IDLE;

  constructor(request: string) {
    this.request = request;
  }

  receiveResponse(response: string) {
    this.response = response;
    this.responseState = ResponseState.SUCCESS;
  }

  getResponse(): string {

    if(!this.response){
      throw new Error("The message has no response");
    }

    return this.response;
  }

  getRequest(): string {
    return this.request
  }
}