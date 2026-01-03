import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateSingleVariation(
  LOVABLE_API_KEY: string,
  image: string,
  variationIndex: number,
  customPrompt?: string
): Promise<string | null> {
  const variationStyles = [
    'subtle lighting changes and slightly different color grading',
    'different artistic interpretation while keeping the same subject',
    'alternative composition with the same elements',
    'different mood and atmosphere',
    'varied contrast and saturation levels'
  ];

  const styleHint = variationStyles[variationIndex % variationStyles.length];

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Create a variation of this image. ${
                customPrompt 
                  ? `Apply these changes: ${customPrompt}. ` 
                  : `Apply ${styleHint}. `
              }CRITICAL REQUIREMENTS:
- Preserve the main subject and identity EXACTLY
- Keep the same general composition
- Create a distinct but related variation
- High quality, photorealistic result
- Variation #${variationIndex + 1}`
            },
            {
              type: 'image_url',
              image_url: { url: image }
            }
          ]
        }
      ],
      modalities: ['image', 'text']
    }),
  });

  if (!response.ok) {
    console.error(`Variation ${variationIndex + 1} failed:`, response.status);
    return null;
  }

  const data = await response.json();
  const editedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  return editedImage || null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, count = 3, prompt } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const variationCount = Math.min(Math.max(1, count), 5);
    console.log(`Generating ${variationCount} variations...`);

    // Generate variations in parallel
    const variationPromises = Array.from({ length: variationCount }, (_, i) =>
      generateSingleVariation(LOVABLE_API_KEY, image, i, prompt)
    );

    const results = await Promise.all(variationPromises);
    const variations = results.filter((v): v is string => v !== null);

    if (variations.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate any variations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generated ${variations.length} variations successfully`);

    return new Response(
      JSON.stringify({ 
        variations, 
        operation: 'generate-variations',
        requested: variationCount,
        generated: variations.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-variations function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
