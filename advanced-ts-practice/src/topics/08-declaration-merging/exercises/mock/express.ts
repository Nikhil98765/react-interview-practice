// Mock stand-in for express + @types/express. DO NOT EDIT.
declare global {
  namespace Express {
    interface Request {
      url: string;
      method: string;
    }
  }
}

export interface Request extends Express.Request {}
export type Handler = (req: Request) => void;

export function get(path: string, handler: Handler): void {
  handler({ url: path, method: "GET" });
}
