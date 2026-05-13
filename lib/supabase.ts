import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type License = {
  id: string
  license_key: string
  email: string | null
  status: 'active' | 'revoked' | 'inactive'
  hardware_id: string | null
  activated_at: string | null
  created_at: string
}
