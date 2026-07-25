export type MessageAuthorProfile = {
  bio: string | null;
  displayName: string | null;
  id: string;
  username: string | null;
};

export interface MessageAuthorProfileReader {
  getMessageAuthorProfileByUserId(
    userId: string,
  ): Promise<MessageAuthorProfile | null>;
}
