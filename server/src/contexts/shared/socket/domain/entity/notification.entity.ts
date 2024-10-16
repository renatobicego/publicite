export class Notification {
  toId: string;
  message: string;
  ids: Map<string, string>;

  constructor(toId: string, message: string, ids: Map<string, string>) {
    this.toId = toId;
    this.message = message;
    this.ids = ids;
  }
}
