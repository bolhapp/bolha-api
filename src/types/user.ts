export type UserType = "user" | "admin";

export type UserGender = "male" | "female" | "other" | "prefer_not_say";

export type UserAvailbility = any;

export interface BaseUser {
  email: string;
  password: string;
  name?: string;
  bio?: string;
  gender?: UserGender;
  birthday?: string;
  city?: string;
  interests?: string[];
  hobbies?: string[];
}

export interface User extends BaseUser {
  id: string;
  verified: boolean;
  token: string;
}

export interface TokenUser {
  email: string;
  password: string;
}
