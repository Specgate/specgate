"use client";

import { AuthClient } from "@corely/auth-client";
import { APP_SOURCE } from "./app-source";
import { WebStorageAdapter } from "./storage-adapter";

export type {
  EmailCodeMode,
  RequestEmailCodeData,
  RequestEmailCodeResponse,
  VerifyEmailCodeData,
  SignUpData,
  SignInData,
  AuthResponse,
  CurrentUserResponse,
} from "@corely/auth-client";

const API_URL = "";
const storage = new WebStorageAdapter();

export const authClient = new AuthClient({
  apiUrl: API_URL,
  storage,
});
