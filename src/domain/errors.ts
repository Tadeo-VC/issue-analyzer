/**
 * Se lanza cuando se intenta invocar una tool por nombre
 * y no existe en el registro del agente.
 */
export class UndefinedToolException extends Error {
  constructor(public readonly toolName: string) {
    super(`Unknown tool: ${toolName}`);
    this.name = "UndefinedToolException";
    Object.setPrototypeOf(this, UndefinedToolException.prototype);
  }
}
