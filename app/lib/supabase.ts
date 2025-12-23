
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
    if (process.env.NODE_ENV === 'production') {
        console.error("CRITICAL: Missing Supabase environment variables in Production!");
    } else {
        console.warn("Supabase environment variables missing. Uploads will fail.");
    }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
