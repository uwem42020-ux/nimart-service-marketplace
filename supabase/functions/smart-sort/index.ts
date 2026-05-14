// supabase/functions/smart-sort/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers – required for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // 1. Handle browser preflight OPTIONS request first
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Only parse JSON for POST requests
    const { user_id, user_lat, user_lng, category, search_term, limit = 20 } =
      await req.json();

    // 3. Fetch user's preferred categories from their bookings
    const { data: userBookings } = await supabase
      .from("bookings")
      .select("provider_id, providers(selected_category_slug)")
      .eq("customer_id", user_id);

    const preferredCategories = new Set<string>();
    userBookings?.forEach((b: any) => {
      const cat = b.providers?.selected_category_slug;
      if (cat) preferredCategories.add(cat);
    });

    // 4. Fetch providers from the materialised view
    let query = supabase.from("provider_scores").select("*");
    if (category) query = query.eq("selected_category_slug", category);
    if (search_term) query = query.ilike("business_name", `%${search_term}%`);
    const { data: providers } = await query.limit(limit);

    if (!providers) {
      return new Response("[]", {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 5. Score each provider
    const scored = providers.map((p: any) => {
      let score = 0;

      // Category preference (0‑10 pts)
      if (preferredCategories.has(p.selected_category_slug)) score += 10;

      // Distance (0‑20 pts) – linear falloff up to 50 km
      if (user_lat && user_lng && p.lat && p.lng) {
        const dist = haversine(user_lat, user_lng, p.lat, p.lng);
        score += Math.max(0, 20 - (dist / 50) * 20);
      }

      // Rating (0‑10 pts)
      score += Math.min(p.avg_rating * 2, 10);

      // Completed bookings (0‑5 pts)
      score += Math.min(p.completed_bookings, 5);

      // Availability (0‑5 pts)
      if (p.status === "available") score += 5;
      else if (p.status === "busy") score += 2;

      // Recency (0‑3 pts)
      score += Math.max(0, 3 - p.hours_since_update / 24);

      return { provider_id: p.id, score: Math.round(score * 10) / 10 };
    });

    // 6. Sort and return
    scored.sort((a: any, b: any) => b.score - a.score);

    return new Response(JSON.stringify(scored.slice(0, limit)), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Haversine helper
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}