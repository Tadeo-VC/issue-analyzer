import { User } from "@/src/domain/user";
import { describe, it, expect } from "vitest";

describe("User", () => {
  it("should create a user with name, email, and id", () => {
    const user = new User("John Doe", "john@example.com", "user-123");
    
    expect(user.getName()).toBe("John Doe");
    expect(user.getId()).toBe("user-123");
  });

  it("should return the correct name", () => {
    const user = new User("Jane Smith", "jane@example.com", "user-456");
    
    expect(user.getName()).toBe("Jane Smith");
  });

  it("should return the correct id", () => {
    const user = new User("Bob Johnson", "bob@example.com", "user-789");
    
    expect(user.getId()).toBe("user-789");
  });

  it("should allow setting a new id", () => {
    const user = new User("Alice Wonder", "alice@example.com", "user-old");
    
    user.setId("user-new");
    
    expect(user.getId()).toBe("user-new");
  });

  it("should maintain other properties after setting id", () => {
    const user = new User("Charlie Brown", "charlie@example.com", "user-001");
    
    user.setId("user-002");
    
    expect(user.getName()).toBe("Charlie Brown");
    expect(user.getId()).toBe("user-002");
  });
});
