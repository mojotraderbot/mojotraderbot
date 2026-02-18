import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, symbol, description, imageBase64, twitter, telegram, website } = await req.json();

    if (!name || !symbol) {
      return new Response(JSON.stringify({ error: "Name and symbol are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Creating metadata for:", name, symbol);

    // If we have a base64 image, upload to pump.fun's IPFS
    let imageUri = "";
    
    if (imageBase64 && imageBase64.startsWith("data:")) {
      console.log("Uploading image to pump.fun IPFS...");
      
      // Extract the base64 data and mime type
      const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return new Response(JSON.stringify({ error: "Invalid base64 image format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      
      // Convert base64 to blob
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create form data for pump.fun IPFS upload
      const formData = new FormData();
      const blob = new Blob([bytes], { type: mimeType });
      formData.append("file", blob, `token.${mimeType.split('/')[1] || 'png'}`);
      formData.append("name", name);
      formData.append("symbol", symbol);
      formData.append("description", description || "");
      formData.append("showName", "true");
      if (twitter) formData.append("twitter", typeof twitter === "string" ? twitter : "");
      if (telegram) formData.append("telegram", typeof telegram === "string" ? telegram : "");
      if (website) formData.append("website", typeof website === "string" ? website : "");

      // Upload to pump.fun's IPFS endpoint
      const ipfsResponse = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: formData,
      });

      if (!ipfsResponse.ok) {
        const errorText = await ipfsResponse.text();
        console.error("IPFS upload error:", ipfsResponse.status, errorText);
        return new Response(JSON.stringify({ 
          error: `IPFS upload failed: ${ipfsResponse.status}`,
          details: errorText
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const ipfsData = await ipfsResponse.json();
      console.log("IPFS upload result:", ipfsData);
      
      imageUri = ipfsData.metadataUri || ipfsData.uri;
    }

    return new Response(JSON.stringify({ 
      metadataUri: imageUri,
      success: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Upload metadata error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to upload metadata" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
