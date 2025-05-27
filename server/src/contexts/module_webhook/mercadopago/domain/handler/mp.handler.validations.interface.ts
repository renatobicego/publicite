export interface MpHandlerValidationsInterface {
  isHashValid(req: Request, header: Record<string, string>): boolean;
}
