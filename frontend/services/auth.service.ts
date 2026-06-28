import client from "../lib/axios";
import { User } from "../types/auth";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  /**
   * Performs standard OAuth2 login sending credentials as application/x-www-form-urlencoded
   */
  async login(email: string, plainPassword: string): Promise<LoginResponse> {
    const params = new URLSearchParams();
    params.append("username", email); // OAuth2 expects 'username' but we map it to email
    params.append("password", plainPassword);

    const response = await client.post<LoginResponse>("/auth/login", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  /**
   * Registers a new user account with JSON payload
   */
  async register(name: string, email: string, plainPassword: string): Promise<User> {
    const response = await client.post<User>("/auth/register", {
      name,
      email,
      password: plainPassword,
    });
    return response.data;
  },

  /**
   * Retrieves the current logged-in user profile details
   */
  async getCurrentUser(): Promise<User> {
    const response = await client.get<User>("/auth/me");
    return response.data;
  },
};

export default authService;
