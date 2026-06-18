import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!
);

// Helper: generate HMAC-SHA512 signature using native Web Crypto
async function generateHmac(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );
  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  const rawBody = await req.text();
  const hash = await generateHmac(PAYSTACK_SECRET, rawBody);
  const paystackSignature = req.headers.get("x-paystack-signature");

  // Debug logging (will appear in invocation details)
  console.log("Body length:", rawBody.length);
  console.log("Computed hash (first 30):", hash.substring(0, 30));
  console.log("Header signature (first 30):", paystackSignature?.substring(0, 30));

  if (hash !== paystackSignature) {
    console.error("Signature mismatch");
    return new Response("Invalid signature", { status: 401 });
  }

  let body;
  try { body = JSON.parse(rawBody); } catch { return new Response("Invalid JSON", { status: 400 }); }

  if (body.event !== "charge.success") {
    return new Response("Not a charge event", { status: 200 });
  }

  const { amount, metadata } = body.data;
  const providerId = metadata?.provider_id;

  if (!providerId || !amount) {
    console.error("Missing metadata/amount");
    return new Response("Missing metadata", { status: 400 });
  }

  const nicoinAmount = Math.floor(amount / 100);

  try {
    await supabase.rpc("adjust_coin_balance", { p_provider_id: providerId, p_amount: nicoinAmount });
    await supabase.from("coin_transactions").insert({
      provider_id: providerId,
      amount: nicoinAmount,
      type: "paystack_purchase",
      reference_id: body.data.reference,
    });

    console.log(`Credited ${nicoinAmount} Nicoin to ${providerId}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Internal error", { status: 500 });
  }
});