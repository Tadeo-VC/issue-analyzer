import { describe, it, expect } from "vitest";
import { Message } from "@/src/domain/Message";

describe("Message", () => {
  it("getRequest returns the request string", () => {
    const request = "Hello world";
    const message = new Message(request);
    expect(message.getRequest()).toBe(request);
  });

  it("getResponse throws error when no response is set", () => {
    const message = new Message("test");
    expect(() => message.getResponse()).toThrow("The message has no response");
  });

  it("getResponse returns the response after receiveResponse is called", () => {
    const message = new Message("test");
    const response = "Response text";
    message.receiveResponse(response);
    expect(message.getResponse()).toBe(response);
  });
});