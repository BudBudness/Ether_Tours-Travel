interface D1Result<T = Record<string, unknown>> { results?: T[]; success: boolean; }
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}
interface D1Database { prepare(query: string): D1PreparedStatement; }
interface Env { DB: D1Database; }

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": status === 200 ? "public, max-age=120, stale-while-revalidate=600" : "no-store",
      "x-content-type-options": "nosniff",
    },
  });

const pageValue = (url: URL, key: string, fallback: number, max: number): number => {
  const raw = url.searchParams.get(key);
  if (!raw || !/^\d+$/.test(raw)) return fallback;
  return Math.min(max, Math.max(1, Number(raw)));
};

async function destinations(env: Env): Promise<Response> {
  const result = await env.DB.prepare(
    "SELECT id, name, slug, country_code, summary, description FROM destinations WHERE status = 'published' ORDER BY name COLLATE NOCASE ASC",
  ).all();
  return json({ data: result.results ?? [] });
}

async function tours(url: URL, env: Env): Promise<Response> {
  const page = pageValue(url, "page", 1, 10000);
  const limit = pageValue(url, "limit", 20, 50);
  const offset = (page - 1) * limit;
  const destination = url.searchParams.get("destination")?.trim().slice(0, 100) ?? "";
  const featured = url.searchParams.get("featured") === "true";
  const filters = ["t.status = 'published'"];
  const values: unknown[] = [];
  if (destination) {
    filters.push("EXISTS (SELECT 1 FROM tour_destinations td JOIN destinations d ON d.id = td.destination_id WHERE td.tour_id = t.id AND d.slug = ? AND d.status = 'published')");
    values.push(destination);
  }
  if (featured) filters.push("t.featured = 1");
  const where = filters.join(" AND ");

  const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM tours t WHERE " + where)
    .bind(...values).first<{ total: number }>();

  const today = new Date().toISOString().slice(0, 10);
  const sql = "SELECT t.id, t.slug, t.title, t.summary, t.description, t.duration_days, t.duration_nights, " +
    "t.price_on_request, t.featured, t.seo_title, t.seo_description, " +
    "(SELECT MIN(p.amount_minor) FROM tour_pricing p WHERE p.tour_id = t.id AND p.status = 'approved' " +
    "AND (p.valid_from IS NULL OR p.valid_from <= ?) AND (p.valid_until IS NULL OR p.valid_until >= ?)) AS lowest_approved_price_minor, " +
    "(SELECT p.currency FROM tour_pricing p WHERE p.tour_id = t.id AND p.status = 'approved' " +
    "AND (p.valid_from IS NULL OR p.valid_from <= ?) AND (p.valid_until IS NULL OR p.valid_until >= ?) " +
    "ORDER BY p.amount_minor ASC LIMIT 1) AS price_currency " +
    "FROM tours t WHERE " + where + " ORDER BY t.featured DESC, t.updated_at DESC LIMIT ? OFFSET ?";
  const result = await env.DB.prepare(sql)
    .bind(today, today, today, today, ...values, limit, offset).all();

  return json({
    data: result.results ?? [],
    pagination: { page, limit, total: count?.total ?? 0, pages: Math.ceil((count?.total ?? 0) / limit) },
  });
}

async function tourDetail(slug: string, env: Env): Promise<Response> {
  const tour = await env.DB.prepare(
    "SELECT id, slug, title, summary, description, duration_days, duration_nights, price_on_request, featured, seo_title, seo_description FROM tours WHERE slug = ? AND status = 'published' LIMIT 1",
  ).bind(slug).first<Record<string, unknown>>();
  if (!tour) return json({ error: "Tour not found" }, 404);

  const today = new Date().toISOString().slice(0, 10);
  const [destinationRows, itineraryRows, inclusionRows, pricingRows] = await Promise.all([
    env.DB.prepare("SELECT d.id, d.name, d.slug, d.country_code, d.summary FROM tour_destinations td JOIN destinations d ON d.id = td.destination_id WHERE td.tour_id = ? AND d.status = 'published' ORDER BY d.name COLLATE NOCASE")
      .bind(tour.id).all(),
    env.DB.prepare("SELECT day_number, title, description, accommodation_notes FROM itinerary_days WHERE tour_id = ? ORDER BY day_number")
      .bind(tour.id).all(),
    env.DB.prepare("SELECT item, item_type, sort_order FROM tour_inclusions WHERE tour_id = ? ORDER BY sort_order, id")
      .bind(tour.id).all(),
    env.DB.prepare("SELECT currency, amount_minor, pricing_basis, valid_from, valid_until FROM tour_pricing WHERE tour_id = ? AND status = 'approved' AND (valid_from IS NULL OR valid_from <= ?) AND (valid_until IS NULL OR valid_until >= ?) ORDER BY amount_minor ASC")
      .bind(tour.id, today, today).all(),
  ]);

  return json({
    data: {
      ...tour,
      destinations: destinationRows.results ?? [],
      itinerary: itineraryRows.results ?? [],
      inclusions: inclusionRows.results ?? [],
      pricing: pricingRows.results ?? [],
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    const url = new URL(request.url);
    try {
      if (url.pathname === "/health") return json({ ok: true, service: "ether-tours-catalogue" });
      if (url.pathname === "/api/destinations") return await destinations(env);
      if (url.pathname === "/api/tours") return await tours(url, env);
      const match = url.pathname.match(/^\/api\/tours\/([a-z0-9-]{1,120})$/);
      if (match) return await tourDetail(match[1], env);
      return json({ error: "Not found" }, 404);
    } catch {
      return json({ error: "Catalogue temporarily unavailable" }, 503);
    }
  },
};
