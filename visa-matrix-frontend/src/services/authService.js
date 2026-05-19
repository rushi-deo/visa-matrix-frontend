import apiClient, { extractResponseData } from "./apiClient";

function normalizeAuthPayload(response) {
  const payload = extractResponseData(response);
  const token = payload?.token;
  const user = payload?.user;

  if (!token || !user) {
    throw new Error("Login response did not include a token and user.");
  }

  return { token, user };
}

export async function loginUser({ email, password }) {
  const response = await apiClient.post("/auth/login", { email, password });
  return normalizeAuthPayload(response);
}

export async function signUpUser({ email, password, ...profile }) {
  const response = await apiClient.post("/auth/signup", { email, password, ...profile });
  return extractResponseData(response);
}

export async function signInUser(credentials) {
  return loginUser(credentials);
}

export async function signOutUser() {
  return true;
}
