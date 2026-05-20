const GLPI_BASE_URL = process.env.GLPI_BASE_URL;
const GLPI_API_KEY = process.env.GLPI_API_KEY;

if (!GLPI_BASE_URL) {
  // Don’t throw at import time in case of tooling; throw on actual call.
}

type GlpiInitSessionResponse = {
  session_token: string;
};

async function glpiFetch<T>(
  path: string,
  init: RequestInit & { headers?: Record<string, string> } = {},
): Promise<T> {
  if (!GLPI_BASE_URL) throw new Error("Missing GLPI_BASE_URL");
  if (!GLPI_API_KEY) throw new Error("Missing GLPI_API_KEY");

  const url = `${GLPI_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    // GLPI is typically self-hosted; no special caching.
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GLPI request failed: ${res.status} ${res.statusText} ${text}`,
    );
  }

  return (await res.json()) as T;
}

export async function initGlpiSession(): Promise<{ sessionToken: string }> {
  // Standard GLPI REST pattern using API token.
  // Endpoint: /apirest.php/initSession
  const resp = await glpiFetch<GlpiInitSessionResponse>(
    " /apirest.php/initSession".trim(),
    {
      method: "POST",
      headers: {
        Authorization: `user_token ${GLPI_API_KEY}`,
      },
      body: JSON.stringify({}),
    },
  );

  return { sessionToken: resp.session_token };
}

export async function glpiGet<T>(
  path: string,
  query?: Record<string, string | number>,
): Promise<T> {
  const params = query
    ? new URLSearchParams(query as Record<string, string>).toString()
    : "";
  const fullPath = params ? `${path}?${params}` : path;

  const { sessionToken } = await initGlpiSession();

  // Most GLPI endpoints accept the session token header.
  return glpiFetch<T>(fullPath, {
    method: "GET",
    headers: {
      "Session-Token": sessionToken,
    },
  });
}

export async function glpiPost<T>(path: string, body: unknown): Promise<T> {
  const { sessionToken } = await initGlpiSession();
  return glpiFetch<T>(path, {
    method: "POST",
    headers: {
      "Session-Token": sessionToken,
    },
    body: JSON.stringify(body),
  });
}
