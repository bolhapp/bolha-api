import { QueryParams } from "./misc";

export type UserType = "user" | "admin";

export type UserGender = "male" | "female" | "other" | "prefer_not_say";

export type UserAvailbility = any;

export interface UserDetails {
  name?: string;
  bio?: string;
  gender?: UserGender;
  birthday?: string;
  city?: string;
}

// includes BE only fields such as password and verified
export interface FullUser extends UserDetails {
  id: string;
  verified: boolean;
  email: string;
  password: string;
  createdAt: number;
  type: UserType;
  picUrl?: string;
  token?: string;
  accessToken?: string;
}

export type User = Omit<FullUser, "password" | "verified" | "createdAt">;

export interface UnregisteredUser extends Omit<FullUser, "id" | "verified" | "createdAt"> {
  interests?: string[];
}

export interface TokenUser {
  email: string;
  id: string;
}

export interface AccountConfirmationPayload {
  email: string;
  token: string;
}

export interface GetOwnActivitiesPayload extends Omit<QueryParams, "query"> {
  userId: string;
}
