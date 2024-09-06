export interface MpHandlerValidationsInterface {
  checkHashValidation(
    req: Request,
    header: Record<string, string>,
  ): Promise<boolean>;
}
