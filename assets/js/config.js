// ==========================================
// KODE FINAL CONFIG.JS (PRODUKSI)
// ==========================================

// ⚠️ PENTING: GANTI TEKS DI BAWAH INI DENGAN KUNCI SUPABASE ASLI ANDA ⚠️
// Pastikan tidak ada spasi ekstra di dalam tanda kutip.

const SUPABASE_URL = 'https://ufplggwklwopzhhwrdqk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcGxnZ3drbHdvcHpoaHdyZHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0Nzc1NDgsImV4cCI6MjEwMDA1MzU0OH0.ftwHcf3pkJkTJUDCYQJDiWVyRzfvbq10CoT6T7B0hEo';

// ==========================================

// Inisialisasi Klien Supabase (Penghubung antara aplikasi dan database)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fungsi Pelacak Error Global
// Fungsi ini membantu memunculkan notifikasi merah di layar jika terjadi kesalahan sistem
function lacakError(judul, pesanError, errorAsli = null) {
    // Catat error di sistem tersembunyi (Console) untuk bahan perbaikan developer
    console.error(`🚨 [${judul}] ERROR:`, errorAsli || pesanError);
    
    const alertBox = document.getElementById('alertBox');
    
    // Jika ada kotak alert di HTML, tampilkan di sana
    if (alertBox) {
        alertBox.innerHTML = `<strong>⚠️ ${judul}</strong><br>${pesanError}`;
        alertBox.style.display = 'block';
        alertBox.style.backgroundColor = '#f8d7da';
        alertBox.style.color = '#721c24';
        alertBox.style.padding = '15px';
        alertBox.style.borderRadius = '5px';
        alertBox.style.border = '1px solid #f5c6cb';
        alertBox.style.marginBottom = '15px';
    } else {
        // Jika tidak ada kotak alert, gunakan pop-up bawaan browser
        alert(`⚠️ ${judul}\n\n${pesanError}\n\n(Buka Inspect Element > Console untuk melihat detail)`);
    }
}