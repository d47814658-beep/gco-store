import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { public_id } = await req.json();
    if (!public_id || typeof public_id !== 'string') {
      return new Response(JSON.stringify({ error: 'public_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME') || 'dpknc20k0';

    if (!apiKey || !apiSecret) {
      return new Response(JSON.stringify({ error: 'Cloudinary credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureString = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHmac('sha1', apiSecret).update(signatureString).digest('hex');

    const formData = new FormData();
    formData.append('public_id', public_id);
    formData.append('timestamp', timestamp);
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      { method: 'POST', body: formData }
    );

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: response.ok ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
