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
    const { image, poseDescription, poseImage } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!poseDescription && !poseImage) {
      return new Response(
        JSON.stringify({ error: 'Pose description or reference image is required' }),
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

    console.log('Processing pose change request...');

    const messageContent: any[] = [
      {
        type: 'text',
        text: `Change the pose/position of the person in this image. ${
          poseDescription 
            ? `Change their pose to: ${poseDescription}. ` 
            : ''
        }CRITICAL REQUIREMENTS:
- Preserve the person's face, identity, facial features, and skin tone EXACTLY
- Keep the same clothing and accessories
- The new pose should look natural and anatomically correct
- Maintain realistic proportions and body structure
- Adjust lighting and shadows to match the new pose
- Keep or adapt the background appropriately
- High quality, photorealistic result
- No distortion of facial features`
      },
      {
        type: 'image_url',
        image_url: { url: image }
      }
    ];

    if (poseImage) {
      messageContent.push({
        type: 'image_url',
        image_url: { url: poseImage }
      });
      messageContent[0].text += '\n\nUse the second image as reference for the pose to apply. Copy the body position and posture from the reference.';
    }

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
            content: messageContent
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to process image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message;
    const images = assistantMessage?.images;

    if (!images || images.length === 0) {
      console.error('No images in response');
      return new Response(
        JSON.stringify({ error: 'No image generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const editedImage = images[0]?.image_url?.url;

    if (!editedImage) {
      return new Response(
        JSON.stringify({ error: 'Invalid image format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Pose changed successfully');

    return new Response(
      JSON.stringify({ editedImage, operation: 'change-pose' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in change-pose function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
