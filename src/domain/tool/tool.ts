export interface Tool {
  call(args: unknown): Promise<string>;
  name(): string;
}
