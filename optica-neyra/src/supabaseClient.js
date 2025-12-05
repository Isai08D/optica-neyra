import { createClient } from '@supabase/supabase-js'

// Estos datos los sacas de Supabase -> Settings -> API
const supabaseUrl = 'https://osykdnzluvmatrdzlleg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zeWtkbnpsdXZtYXRyZHpsbGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MDM0MTQsImV4cCI6MjA4MDQ3OTQxNH0.U1EoTzRSI2RJlLYmo9tz9u43vWA_PHw-FgY6l0pdjBc'

export const supabase = createClient(supabaseUrl, supabaseKey)