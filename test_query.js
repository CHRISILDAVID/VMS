const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://zrokzmkhrznmtgfdibig.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyb2t6bWtocnpmbXRnZmRpYmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIyMjE4NTUsImV4cCI6MjAzNzc5Nzg1NX0.m5l3w5vj3lY_jR1D5vL' // Wait, I don't have the anon key. 
);
