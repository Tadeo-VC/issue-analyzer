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
}