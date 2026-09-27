// Supabase client. Bloom runs in "cloud" mode only when both env vars are set;
// otherwise everything stays on the device (localStorage) and the demo works offline.
import { createClient } from "@supabase/supabase-js";

var url = process.env.NEXT_PUBLIC_SUPABASE_URL;
var key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export var supabase = url && key ? createClient(url, key) : null;

export function cloudEnabled() {
  return !!supabase;
}
