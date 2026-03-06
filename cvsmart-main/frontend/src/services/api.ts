import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
) {
  const supabase = createClientComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User is not authenticated");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "An request failed");
  }

  return response.json();
}

export const api = {
  getUserProfile: () => fetchWithAuth("/user/profile"),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateUserProfile: (data: any) =>
    fetchWithAuth("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
