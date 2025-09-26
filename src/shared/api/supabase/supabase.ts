import { API_KEYS } from "@/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = API_KEYS.supabase.url;
const supabaseKey = API_KEYS.supabase.publishableKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
