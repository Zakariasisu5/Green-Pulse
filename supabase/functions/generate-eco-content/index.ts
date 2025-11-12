import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "daily") {
      const goals = profile?.goals?.join(", ") || "general sustainability";
      const location = profile?.location || "your area";
      
      systemPrompt = `You are a friendly eco-coach helping people in ${location} live sustainably. Keep tips practical, local, and actionable.`;
      
      if (profile?.spiritual_mode) {
        userPrompt = `Generate:
1. One daily eco-tip focused on: ${goals}
2. One spiritual affirmation about sustainable living

Format as JSON:
{
  "tip": "practical eco tip here",
  "affirmation": "spiritual affirmation here"
}`;
      } else {
        userPrompt = `Generate one daily eco-tip focused on: ${goals}. Keep it practical and actionable.

Format as JSON:
{
  "tip": "practical eco tip here"
}`;
      }
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse as JSON, fallback to simple object
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      result = {
        tip: content,
        affirmation: profile?.spiritual_mode ? "Today, I honor the Earth and myself." : undefined
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in generate-eco-content:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});