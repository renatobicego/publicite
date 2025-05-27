export class PostComment {
  private user: string;
  private comment: string;
  private isEdited: boolean;

  constructor(userId: string, comment: string, isEdited: boolean) {
    this.user = userId;
    this.comment = comment;
    this.isEdited = isEdited;
  }
}
