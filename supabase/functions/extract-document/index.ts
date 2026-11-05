import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Anthropic from 'npm:@anthropic-ai/sdk@0.36.3';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  try {
    const { fileBase64, mediaType, fields = [] } = await req.json();
    if (!fileBase64 || !mediaType || !['application/pdf', 'image/jpeg', 'image/png'].includes(mediaType)) throw new Error('Unsupported or missing document');
    if (fileBase64.length > 10_000_000) throw new Error('Document exceeds the 7.5 MB encoded limit');
    const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
    const source = mediaType === 'application/pdf'
      ? { type: 'document', source: { type: 'base64', media_type: mediaType, data: fileBase64 } }
      : { type: 'image', source: { type: 'base64', media_type: mediaType, data: fileBase64 } };
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022', max_tokens: 1200,
      system: 'Extract only visible document facts. Return strict JSON with keys matching requested fields. Use null when absent. Never infer Aadhaar digits or sensitive facts.',
      messages: [{ role: 'user', content: [source, { type: 'text', text: `Requested fields: ${JSON.stringify(fields)}. Return JSON only.` }] }]
    });
    const text = response.content.find(x => x.type === 'text')?.text || '{}';
    const json = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''));
    return new Response(JSON.stringify({ fields: json, model: response.model }), { headers: { ...headers, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Extraction failed' }), { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } });
  }
});
