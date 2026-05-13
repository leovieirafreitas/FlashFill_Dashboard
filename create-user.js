import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rudhtwriohqmrwnkfkdq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZGh0d3Jpb2hxbXJ3bmtma2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTUxODMsImV4cCI6MjA5NDI3MTE4M30.iPaY--LfmkR5KOWkTPWFFR1D2T2ZoZH49jRCQguGz_g'
)

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@flashfill.com',
    password: 'flashfill2026',
  })
  if (error) console.error('Erro:', error.message)
  else console.log('Usuário criado:', data.user?.id)
}

createAdmin()
