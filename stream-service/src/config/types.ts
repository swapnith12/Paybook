export type BookStreamEvent = {
  type: "BOOK_STREAM";
  bookId: string;
  ip?: string;
  userAgent?: string;
  timestamp: number;
};