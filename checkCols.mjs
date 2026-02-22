import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ucyoljuwvtvddhtgogyt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjeW9sanV3dnR2ZGRodGdvZ3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MjI0NjIsImV4cCI6MjA4NzI5ODQ2Mn0.k-4DY48bdElIYAN_KGc7LH_dZ1suVTSBbVRUfkFRRLI'
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    const { data: profiles, error } = await supabase.from('profiles').select('*').limit(1);
    console.log(profiles ? Object.keys(profiles[0] || {}) : "No profiles found");
    console.log(error);
}

run();
