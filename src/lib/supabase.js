import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://shvbedzlxkqfvrsvarzl.supabase.co'
const SUPABASE_KEY = 'sb_publishable_EmPNZRHeDUNoDJrH150hoQ_6NoiA_zr'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
