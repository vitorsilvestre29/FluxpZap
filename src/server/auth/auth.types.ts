export type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
