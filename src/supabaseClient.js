import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uuepngrymfzxvwtlktro.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXBuZ3J5bWZ6eHZ3dGxrdHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjgxNzEsImV4cCI6MjA4MzcwNDE3MX0.66rISyLq-34qjm0gTy38sercaHS5NXs314VBoO4sJqM'

export const supabase = createClient(supabaseUrl, supabaseKey)