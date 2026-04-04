const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  throw new Error(
    "Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.",
  );
}

const restBase = `${supabaseUrl}/rest/v1`;

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

function buildUrl(path: string) {
  return `${restBase}/${path.replace(/^\//, "")}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!response.ok) {
    const errorMessage =
      (data &&
        typeof data === "object" &&
        (data.message || data.error_description || data.details)) ||
      `Falha na requisição ao Supabase (${response.status})`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export async function restRequest<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return parseResponse<T>(response);
}

export function encodeValue(value: string | number | boolean) {
  return encodeURIComponent(String(value));
}

export async function signInWithPassword(email: string, password: string) {
  const url = `${supabaseUrl}/auth/v1/token?grant_type=password`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || "Erro ao fazer login.");
  }

  return data;
}
