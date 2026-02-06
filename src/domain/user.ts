export class User {
  private id: string;
  private name: string;
  private email: string;
  private password: string;

  constructor(name: string, email: string, password: string, id: string) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.id = id;
  }

  getId(): string {
    return this.id;
  }

  setId(id: string): void {
    this.id = id;
  }
}