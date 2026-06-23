import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kiitcnlrzzdajsbezlsk.supabase.co";
const supabaseAnonKey = "sb_publishable_fbErQ6dV84DzTBeO248vzA_Np38VXOG";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
