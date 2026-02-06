import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ergadtdtyptueyeuegcf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZ2FkdGR0eXB0dWV5ZXVlZ2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3OTkyNjksImV4cCI6MjA4MzM3NTI2OX0.Qw5sXMLXrWdBuNeW7xPKOOVFIsLDDgCbi40zJQQjiNM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
