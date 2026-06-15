import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const FROM_EMAIL = "Nimart <info@nimart.ng>";

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
      },
      status: 200,
    });
  }

  try {
    const body = await req.json();

    // Determine if it's a bulk request (emails array) or single request (to)
    const recipients = body.emails || (body.to ? [body.to] : []);
    const subject = body.subject || "";
    const htmlContent = body.content || body.html || "";

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ error: "No recipients" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const results = [];
    for (const recipient of recipients) {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [recipient],
        subject,
        html: htmlContent,
      });

      if (error) {
        results.push({ email: recipient, error: error.message });
      } else {
        results.push({ email: recipient, success: true });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});