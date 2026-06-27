// Verifica el PIN de entrada contra el hash SHA-256 almacenado en env var
// El hash NUNCA se expone al cliente
export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { pin } = await context.request.json();

    if (!pin || typeof pin !== 'string') {
      return new Response(JSON.stringify({ valid: false }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calcular SHA-256 del PIN recibido
    const encoded = new TextEncoder().encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Comparar con el hash almacenado en variable de entorno
    const valid = hashHex === context.env.ENTRY_PIN_HASH;

    return new Response(JSON.stringify({ valid }), {
      status: valid ? 200 : 401,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ valid: false }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}