// assets/js/config.js

const SUPABASE_URL = 'https://ufplggwklwopzhhwrdqk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__w3cfwVxSr7G_ZXlyyPcpg_c0GuwxeI';

// Gunakan akses global yang benar dari library
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);