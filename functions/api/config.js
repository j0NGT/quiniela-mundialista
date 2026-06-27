// Expone credenciales de Supabase al frontend
// Solo la URL y la anon key (que es pública por diseño en Supabase)
export async function onRequest(context) {
  return new Response(JSON.stringify({
    supabaseUrl: context.env.SUPABASE_URL,
    supabaseAnonKey: context.env.SUPABASE_ANON_KEY
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}