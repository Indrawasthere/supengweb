/**
 * GLPI REST API Client — Production Ready
 *
 * Env vars yang dibutuhkan di .env.local:
 *   GLPI_BASE_URL=https://glpi.parkee.app   (tanpa trailing slash)
 *   GLPI_API_KEY=your_user_api_token
 *   GLPI_APP_TOKEN=your_app_token           (optional, kalau GLPI lo require app_token)
 */

const GLPI_BASE_URL = process.env.GLPI_BASE_URL?.replace(/\/$/, "");
const GLPI_API_KEY = process.env.GLPI_API_KEY;
const GLPI_APP_TOKEN = process.env.GLPI_APP_TOKEN;

// ---------- Types ----------

export type GlpiUser = {
  id: number;
  name: string;
};

export type GlpiGroup = {
  id: number;
  name: string;
};

export type GlpiTicketRaw = {
  id: number;
  name: string;
  content?: string;
  date: string; // opening_date
  closedate?: string;
  solvedate?: string;
  date_mod: string; // last_update
  status: number;
  urgency: number;
  impact: number;
  priority: number;
  itilcategories_id?: number;
  locations_id?: number;
  percent_done?: number;
  // linked via expand
  _users_id_requester?: Array<{ id: number; name: string }>;
  _users_id_assign?: Array<{ id: number; name: string }>;
  _groups_id_assign?: Array<{ id: number; name: string }>;
};

// ---------- Status / Priority Maps ----------

export const GLPI_STATUS: Record<number, string> = {
  1: "New",
  2: "Processing (assigned)",
  3: "Processing (planned)",
  4: "Waiting",
  5: "Solved",
  6: "Closed",
};

export const GLPI_PRIORITY: Record<number, string> = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
  6: "Major",
};

export const GLPI_URGENCY: Record<number, string> = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
};

// ---------- Session Management ----------

let _cachedSession: { token: string; expiresAt: number } | null = null;

async function getSessionToken(): Promise<string> {
  // Cache session selama 45 menit (GLPI default expire 1 jam)
  if (_cachedSession && _cachedSession.expiresAt > Date.now()) {
    return _cachedSession.token;
  }

  if (!GLPI_BASE_URL) throw new Error("GLPI_BASE_URL not set in environment");
  if (!GLPI_API_KEY) throw new Error("GLPI_API_KEY not set in environment");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `user_token ${GLPI_API_KEY}`,
  };

  if (GLPI_APP_TOKEN) {
    headers["App-Token"] = GLPI_APP_TOKEN;
  }

  const res = await fetch(`${GLPI_BASE_URL}/apirest.php/initSession`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GLPI initSession failed ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { session_token: string };
  _cachedSession = {
    token: data.session_token,
    expiresAt: Date.now() + 45 * 60 * 1000,
  };

  return _cachedSession.token;
}

// ---------- Core fetch ----------

async function glpiFetch<T>(
  path: string,
  options: RequestInit & {
    query?: Record<string, string | number | boolean>;
  } = {},
): Promise<T> {
  const sessionToken = await getSessionToken();

  const { query, ...fetchOptions } = options;
  const params = query
    ? "?" +
      new URLSearchParams(
        Object.fromEntries(
          Object.entries(query).map(([k, v]) => [k, String(v)]),
        ),
      ).toString()
    : "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Session-Token": sessionToken,
    ...(GLPI_APP_TOKEN ? { "App-Token": GLPI_APP_TOKEN } : {}),
    ...((fetchOptions.headers as Record<string, string>) ?? {}),
  };

  const url = `${GLPI_BASE_URL}/apirest.php${path}${params}`;

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
    cache: "no-store",
  });

  // Session expired → invalidate cache dan retry sekali
  if (res.status === 401 || res.status === 403) {
    _cachedSession = null;
    const retryToken = await getSessionToken();
    headers["Session-Token"] = retryToken;

    const retryRes = await fetch(url, {
      ...fetchOptions,
      headers,
      cache: "no-store",
    });

    if (!retryRes.ok) {
      const body = await retryRes.text().catch(() => "");
      throw new Error(`GLPI ${path} failed ${retryRes.status}: ${body}`);
    }

    return retryRes.json() as Promise<T>;
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GLPI ${path} failed ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ---------- Public API ----------

/**
 * Ambil list tiket dengan filter.
 * Default: ambil tiket yang masih aktif (status 1,2,3,4)
 */
export async function getTickets(opts: {
  range?: string;
  statusFilter?: number[]; // default: [1,2,3,4] = ongoing
  assignedGroupName?: string; // filter by group name (misal: "Technical Support Engineer")
  withLinkedUsers?: boolean;
}): Promise<GlpiTicketRaw[]> {
  const {
    range = "0-99",
    statusFilter = [1, 2, 3, 4],
    withLinkedUsers = true,
  } = opts;

  // GLPI search criteria — filter status
  const criteria = statusFilter.map((s, i) => ({
    [`criteria[${i}][field]`]: "12", // field 12 = status
    [`criteria[${i}][searchtype]`]: "equals",
    [`criteria[${i}][value]`]: String(s),
    [`criteria[${i}][link]`]: i === 0 ? "AND" : "OR",
  }));

  // Build flat query object
  const query: Record<string, string> = {
    range,
    "forcedisplay[0]": "2", // name
    "forcedisplay[1]": "12", // status
    "forcedisplay[2]": "10", // urgency
    "forcedisplay[3]": "11", // impact
    "forcedisplay[4]": "3", // priority
    "forcedisplay[5]": "15", // date
    "forcedisplay[6]": "19", // date_mod
    "forcedisplay[7]": "7", // percent_done
    "forcedisplay[8]": "4", // requester name
    "forcedisplay[9]": "5", // requester
    "forcedisplay[10]": "8", // assigned user
    "forcedisplay[11]": "83", // assigned group
    is_deleted: "0",
    order: "DESC",
    sort: "19", // sort by last modified
  };

  criteria.forEach((c) => {
    Object.assign(query, c);
  });

  try {
    // Pakai search endpoint supaya bisa filter
    const res = await glpiFetch<
      { data?: GlpiTicketRaw[]; count?: number } | GlpiTicketRaw[]
    >("/Ticket", {
      query: query as unknown as Record<string, string | number | boolean>,
    });

    const items = Array.isArray(res)
      ? res
      : ((res as { data?: GlpiTicketRaw[] }).data ?? []);
    return items;
  } catch {
    // Fallback: ambil semua tiket tanpa filter advanced
    const res = await glpiFetch<GlpiTicketRaw[]>("/Ticket", {
      query: { range, is_deleted: false, order: "DESC", sort: "19" },
    });
    return Array.isArray(res) ? res : [];
  }
}

/**
 * Get single ticket detail dengan expand links
 */
export async function getTicketById(id: number): Promise<GlpiTicketRaw | null> {
  try {
    const ticket = await glpiFetch<GlpiTicketRaw>(`/Ticket/${id}`, {
      query: {
        with_logs: true,
        with_tickets_links: true,
      },
    });
    return ticket;
  } catch {
    return null;
  }
}

/**
 * Get users yang di-assign ke ticket
 */
export async function getTicketAssignedUsers(
  ticketId: number,
): Promise<GlpiUser[]> {
  try {
    const res = await glpiFetch<
      Array<{ id: number; users_id: number; name: string }>
    >(
      `/Ticket/${ticketId}/Ticket_User`,
      { query: { type: "2" } }, // type 2 = assigned
    );
    return res.map((r) => ({ id: r.users_id, name: r.name }));
  } catch {
    return [];
  }
}

/**
 * Get requester ticket
 */
export async function getTicketRequesters(
  ticketId: number,
): Promise<GlpiUser[]> {
  try {
    const res = await glpiFetch<
      Array<{ id: number; users_id: number; name: string }>
    >(
      `/Ticket/${ticketId}/Ticket_User`,
      { query: { type: "1" } }, // type 1 = requester
    );
    return res.map((r) => ({ id: r.users_id, name: r.name }));
  } catch {
    return [];
  }
}

/**
 * Get assigned group untuk ticket
 */
export async function getTicketGroups(ticketId: number): Promise<GlpiGroup[]> {
  try {
    const res = await glpiFetch<
      Array<{ id: number; groups_id: number; name: string }>
    >(
      `/Ticket/${ticketId}/Group_Ticket`,
      { query: { type: "2" } }, // type 2 = assigned group
    );
    return res.map((r) => ({ id: r.groups_id, name: r.name }));
  } catch {
    return [];
  }
}

/**
 * Health check — test apakah GLPI bisa direach
 */
export async function checkGlpiHealth(): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    await getSessionToken();
    return { ok: true, message: "GLPI terhubung" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "GLPI tidak terhubung",
    };
  }
}
