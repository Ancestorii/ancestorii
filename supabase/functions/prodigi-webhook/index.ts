import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const SUPABASE_URL = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const payload = await req.json();

    // Prodigi sends: { event, order }
    const eventType = payload?.event;
    const prodigiOrder = payload?.order;
    const prodigiOrderId = prodigiOrder?.id;

    if (!prodigiOrderId) {
      return new Response("No order ID in payload", { status: 200 });
    }

    console.log(`Prodigi webhook: ${eventType} for order ${prodigiOrderId}`);

    // Map Prodigi status to our status
    const stage = prodigiOrder?.status?.stage ?? "";

    let orderStatus = "printing";
    let prodigiStatus = stage;
    let trackingUrl: string | null = null;
    let shippedAt: string | null = null;

    if (stage === "Complete") {
      orderStatus = "delivered";
      prodigiStatus = "delivered";
    } else if (stage === "Shipped") {
      orderStatus = "shipped";
      prodigiStatus = "shipped";
      shippedAt = new Date().toISOString();

      // Extract tracking URL if available
      const shipments = prodigiOrder?.shipments ?? [];
      if (shipments.length > 0) {
        trackingUrl = shipments[0]?.tracking?.url ?? null;
      }
    } else if (stage === "InProgress") {
      orderStatus = "printing";
      prodigiStatus = "printing";
    } else if (stage === "Cancelled") {
      orderStatus = "cancelled";
      prodigiStatus = "cancelled";
    }

    // Update orders table
    const updateData: Record<string, unknown> = {
      prodigi_status: prodigiStatus,
      status: orderStatus,
    };

    if (trackingUrl) {
      updateData.prodigi_tracking_url = trackingUrl;
    }

    if (shippedAt) {
      updateData.shipped_at = shippedAt;
    }

    await supabase
      .from("orders")
      .update(updateData)
      .eq("prodigi_order_id", prodigiOrderId);

    // Also update memory_books
    const memoryBookUpdate: Record<string, unknown> = {
      prodigi_status: prodigiStatus,
    };

    if (trackingUrl) {
      memoryBookUpdate.tracking_url = trackingUrl;
    }

    await supabase
      .from("memory_books")
      .update(memoryBookUpdate)
      .eq("prodigi_order_id", prodigiOrderId);

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Prodigi webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      status: 400,
    });
  }
});