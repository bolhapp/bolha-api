export type UserType = "user" | "admin";

export type UserGender = "male" | "female" | "other" | "prefer_not_say";

export type UserAvailbility = any;

export interface UserDetails {
  name?: string;
  bio?: string;
  gender?: UserGender;
  birthday?: string;
  city?: string;
  interests?: string[];
  hobbies?: string[];
}

// includes BE only fields such as password and verified
export interface FullUser extends UserDetails {
  id: string;
  verified: boolean;
  email: string;
  password: string;
  createdAt: number;
  type: UserType;
  token?: string;
}

export type User = Omit<FullUser, "password" | "verified" | "createdAt">;

export type UnregisteredUser = Omit<FullUser, "id" | "verified" | "createdAt">;

export interface TokenUser {
  email: string;
  id: string;
}

export interface AccountConfirmationPayload {
  email: string;
  token: string;
}
