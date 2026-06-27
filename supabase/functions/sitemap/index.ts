import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (_req) => {
  try {
    const baseUrl = "https://nimart.ng";

    const staticUrls = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/search", priority: "0.9", changefreq: "daily" },
      { loc: "/blog", priority: "0.9", changefreq: "daily" },
      { loc: "/careers", priority: "0.5", changefreq: "weekly" },
      { loc: "/auth/signup", priority: "0.8", changefreq: "weekly" },
      { loc: "/auth/signup?role=provider", priority: "0.8", changefreq: "weekly" },
      { loc: "/auth/signin", priority: "0.7", changefreq: "weekly" },
      { loc: "/help", priority: "0.7", changefreq: "monthly" },
      { loc: "/safety", priority: "0.6", changefreq: "monthly" },
      { loc: "/terms", priority: "0.3", changefreq: "yearly" },
      { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
      { loc: "/cookies", priority: "0.3", changefreq: "yearly" },
      { loc: "/report", priority: "0.4", changefreq: "monthly" },
      { loc: "/nimart-vs-nimart", priority: "0.4", changefreq: "monthly" },
      { loc: "/nimart-explained", priority: "0.8", changefreq: "monthly" },
      { loc: "/about", priority: "0.7", changefreq: "monthly" },   // ← NEW
    ];

    const { data: providers, error: providerError } = await supabase
      .from("providers")
      .select("id, updated_at")
      .eq("is_available", true)
      .order("updated_at", { ascending: false });

    if (providerError) throw providerError;

    const providerUrls = (providers || []).map((p) => ({
      loc: `${baseUrl}/provider/${p.id}`,
      lastmod: p.updated_at ? p.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: "0.7",
    }));

    const { data: catLgaPairs, error: pairError } = await supabase
      .from("providers")
      .select("selected_category_slug, profiles!inner(lga_id)")
      .eq("is_available", true);

    const pairs = new Set<string>();
    if (!pairError && catLgaPairs) {
      catLgaPairs.forEach((row: any) => {
        const lgaId = row.profiles?.lga_id;
        if (row.selected_category_slug && lgaId) {
          pairs.add(`${row.selected_category_slug}__${lgaId}`);
        }
      });
    }

    const serviceLocationUrls = Array.from(pairs).map((pair) => {
      const [cat, lga] = pair.split("__");
      return {
        loc: `${baseUrl}/services/${cat}/in/${lga}`,
        lastmod: new Date().toISOString().split("T")[0],
        changefreq: "weekly",
        priority: "0.7",
      };
    });

    const { data: blogPosts, error: blogError } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false });

    if (blogError) throw blogError;

    const blogUrls = (blogPosts || []).map((p) => ({
      loc: `${baseUrl}/blog/${p.slug}`,
      lastmod: p.updated_at ? p.updated_at.split("T")[0] : new Date().toISOString().split("T")[0],
      changefreq: "monthly",
      priority: "0.6",
    }));

    const urlset = [
      ...staticUrls.map((u) => ({
        loc: `${baseUrl}${u.loc}`,
        lastmod: new Date().toISOString().split("T")[0],
        changefreq: u.changefreq,
        priority: u.priority,
      })),
      ...providerUrls,
      ...serviceLocationUrls,
      ...blogUrls,
    ];

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
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return new Response("Error generating sitemap", { status: 500 });
  }
});