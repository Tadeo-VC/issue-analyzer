import { describe, it, expect } from "vitest";
import { Message } from "@/src/domain/message";

describe("Message", () => {
  it("getRequest returns the request string", () => {
    const request = "Hello world";
    const message = new Message(request);
    expect(message.getRequest()).toBe(request);
  });

  it("getResponse returns undefined when no response is set", () => {
    const message = new Message("test");
    expect(message.getResponse()).toBeUndefined();
  });

  it("getResponse returns the response after receiveResponse is called", () => {
    const message = new Message("test");
    const response = "Response text";
    message.receiveResponse(response);
    expect(message.getResponse()).toBe(response);
  });

  it("hasResponse returns false when no response is set", () => {
    const message = new Message("test");
    expect(message.hasResponse()).toBe(false);
  });

  it("hasResponse returns true after receiveResponse is called", () => {
    const message = new Message("test");
    message.receiveResponse("response");
    expect(message.hasResponse()).toBe(true);
  });

  it("getResponseState returns IDLE when no response is set", () => {
    const message = new Message("test");
    expect(message.getResponseState()).toBe("IDLE");
  });

  it("getResponseState returns SUCCESS after receiveResponse is called", () => {
    const message = new Message("test");
    message.receiveResponse("response");
    expect(message.getResponseState()).toBe("SUCCESS");
  });
});