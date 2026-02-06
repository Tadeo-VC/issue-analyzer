export interface Tool {
  readonly name: string;
  call(args: unknown): Promise<string>;
  getName(): string;
}
