import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_SUPABASE_URL') || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.error('CRITICAL: Supabase environment variables are missing or default placeholders. Please check .env.local and restart the server.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
