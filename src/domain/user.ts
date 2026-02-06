export class User {
  private id: string;
  private name: string;
  private email: string;

  constructor(name: string, email: string, id: string) {
    this.name = name;
    this.email = email;
    this.id = id;
  }

  getId(): string {
    return this.id;
  }

  setId(id: string): void {
    this.id = id;
  }
}