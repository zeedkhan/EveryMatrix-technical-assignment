// https://stackoverflow.com/questions/61132262/typescript-deep-partial

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
  Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export interface CreateRoomSchema {
  name: string;
  userId: string;
}

export interface CreateUserSchema {
  name: string;
  email: string;
  password: string;
}

export interface LoginSchema {
  email: string;
  password: string;
}