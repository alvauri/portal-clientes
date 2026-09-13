// assets/js/config.js
const SUPABASE_URL = 'https://nufoejpqbmyatnsurtyj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51Zm9lanBxYm15YXRuc3VydHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDk4MzEsImV4cCI6MjEwNDgyNTgzMX0.FPUFNVAScPbmFbRDbItaj62R1SqKA9XCfcfOFctHt44';

// Cliente global de Supabase
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);