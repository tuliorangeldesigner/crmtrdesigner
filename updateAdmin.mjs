import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ucyoljuwvtvddhtgogyt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjeW9sanV3dnR2ZGRodGdvZ3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MjI0NjIsImV4cCI6MjA4NzI5ODQ2Mn0.k-4DY48bdElIYAN_KGc7LH_dZ1suVTSBbVRUfkFRRLI'
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    console.log("Consultando perfis...");
    const { data: profiles, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.error("Erro ao buscar:", error);
    } else {
        console.log("Perfis encontrados:", profiles);
        for (const p of profiles || []) {
            console.log(`Atualizando ${p.email} para admin...`);
            const { error: upErr } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', p.id);
            if (upErr) console.error("Erro update:", upErr);
            else console.log("Atualizado c/ sucesso!");
        }
    }
}

run();
