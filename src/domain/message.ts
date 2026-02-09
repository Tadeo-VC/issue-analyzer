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

  getResponse(): string | undefined {
    return this.response;
  }

  getRequest(): string {
    return this.request
  }

  getResponseState(): string {
    return ResponseState[this.responseState];
  }

  hasResponse(): boolean {
    return this.response !== undefined;
  }
}

enum ResponseState {
    IDLE,
    SUCCESS,
    ERROR,
  }