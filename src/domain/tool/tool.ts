export interface Tool {
  call(args: unknown): Promise<string>;
  readonly name: string;
}
