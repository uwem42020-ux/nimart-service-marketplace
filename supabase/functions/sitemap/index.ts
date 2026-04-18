import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  try {
    // Fetch all available provider IDs and their last update time
    const { data: providers, error } = await supabase
      .from("providers")
      .select("id, updated_at")
      .eq("is_available", true)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const baseUrl = "https://nimart.ng";

    // Static URLs with their priorities and change frequencies
    const staticUrls = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/search", priority: "0.8", changefreq: "weekly" },
      { loc: "/terms", priority: "0.3", changefreq: "yearly" },
      { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
      { loc: "/cookies", priority: "0.3", changefreq: "yearly" },
      { loc: "/safety", priority: "0.5", changefreq: "monthly" },
      { loc: "/help", priority: "0.5", changefreq: "monthly" },
    ];

    // Build the URL set
    const urlset = [
      ...staticUrls.map((u) => ({
        loc: `${baseUrl}${u.loc}`,
        lastmod: new Date().toISOString().split("T")[0],
        changefreq: u.changefreq,
        priority: u.priority,
      })),
      ...(providers || []).map((p) => ({
        loc: `${baseUrl}/provider/${p.id}`,
        lastmod: p.updated_at ? p.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
        changefreq: "weekly",
        priority: "0.7",
      })),
    ];

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return new Response("Error generating sitemap", { status: 500 });
  }
});