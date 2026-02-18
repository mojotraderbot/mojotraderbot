import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    console.log("Proxying request to PumpPortal:", JSON.stringify(body, null, 2));

    // Forward request to PumpPortal API
    const response = await fetch("https://pumpportal.fun/api/trade-local", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // PumpPortal trade-local returns raw transaction BYTES on success, not JSON
    if (!response.ok) {
      const responseText = await response.text();
      console.log("PumpPortal error status:", response.status, responseText.substring(0, 300));
      let errorData: { error?: string; details?: unknown } = {};
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText || `PumpPortal API error: ${response.status}` };
      }
      return new Response(JSON.stringify({
        error: errorData.error || `PumpPortal API error: ${response.status}`,
        status: response.status,
        details: errorData
      }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transactionBytes = new Uint8Array(await response.arrayBuffer());
    console.log("PumpPortal success, transaction size:", transactionBytes.length);

    // Encode bytes to base64 so client can decode and deserialize
    let binary = "";
    for (let i = 0; i < transactionBytes.length; i++) {
      binary += String.fromCharCode(transactionBytes[i]);
    }
    const transactionBase64 = btoa(binary);

    return new Response(JSON.stringify({ transaction: transactionBase64 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Proxy request failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
