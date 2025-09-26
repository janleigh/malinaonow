import { API_KEYS } from "@/config";
import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = API_KEYS.supabase.url as string;
const supabaseKey = API_KEYS.supabase.publishableKey as string;

export const supabase = createClient(supabaseUrl, supabaseKey);
