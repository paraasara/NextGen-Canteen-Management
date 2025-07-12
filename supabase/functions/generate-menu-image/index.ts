
// Deno/Typescript Supabase Edge Function to generate images using OpenAI's API
// Stores request/response logs for debugging

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, size = "1024x1024" } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "Missing OpenAI API Key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Talk to OpenAI API
    const resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size,
        response_format: "b64_json"
      }),
    });

    const data = await resp.json();

    if (resp.status !== 200) {
      return new Response(JSON.stringify({
        error: data.error?.message || "Error from OpenAI",
        status: resp.status
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: resp.status,
      });
    }

    // Return the base64 image data
    return new Response(JSON.stringify({ image: data.data[0].b64_json }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[generate-menu-image] Error:", error);
    return new Response(JSON.stringify({ error: error.message || error.toString() }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
