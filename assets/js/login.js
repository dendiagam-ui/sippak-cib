// ==========================================
// LOGIKA LOGIN SUPABASE FINAL (MANDIRI / STANDALONE)
// ==========================================

// KITA MASUKKAN KUNCI LANGSUNG DI SINI AGAR TIDAK ERROR KARENA GAGAL BACA FILE LAIN
const URL_LOGIN = 'https://ufplggwklwopzhhwrdqk.supabase.co';
const KEY_LOGIN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcGxnZ3drbHdvcHpoaHdyZHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0Nzc1NDgsImV4cCI6MjEwMDA1MzU0OH0.ftwHcf3pkJkTJUDCYQJDiWVyRzfvbq10CoT6T7B0hEo';

// Buat koneksi lokal khusus untuk sistem login
const supabaseAuth = window.supabase.createClient(URL_LOGIN, KEY_LOGIN);

async function prosesLogin(event) {
    event.preventDefault();

    const emailInput = document.getElementById('emailVal');
    const passwordInput = document.getElementById('passwordVal');
    const btn = document.getElementById('btnLogin');

    if (!emailInput || !passwordInput || !btn) {
        alert("⚠️ Error: Form login tidak terdeteksi oleh sistem.");
        return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;
    const teksAsli = btn.innerHTML;

    btn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Memverifikasi...";
    btn.disabled = true;

    try {
        // 1. Cek Email & Password ke Supabase
        const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({ email, password });
        if (authError) throw authError; 

        // 2. Ambil Profil Pengguna (Role)
        const { data: profileData, error: profileError } = await supabaseAuth
            .from('profiles')
            .select('role, nama_lengkap')
            .eq('id', authData.user.id)
            .single();

        if (profileError) throw new Error("Gagal mengambil biodata. Pastikan akun ini terdaftar di menu Daftar Akun.");
        if (!profileData) throw new Error("Akun Anda belum memiliki Role Akses.");

        const role = profileData.role.toLowerCase();
        
        // Simpan sesi
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_nama', profileData.nama_lengkap);

        // 3. Arahkan Halaman Sesuai Role
        if (role === 'warga') {
            window.location.href = "warga.html";
        } else if (role === 'petugas' || role === 'superadmin') {
            window.location.href = "dashboard-master.html";
        } else {
            throw new Error("Role tidak valid: " + role);
        }

    } catch (err) {
        let pesanUser = err.message || "Terjadi kesalahan saat menghubungi server.";
        if (pesanUser.includes("Invalid login")) pesanUser = "Email atau Kata Sandi yang Anda masukkan salah!";
        if (pesanUser.includes("Email not confirmed")) pesanUser = "Email belum diverifikasi.";
        
        alert("Gagal Masuk:\n" + pesanUser);

        btn.innerHTML = teksAsli;
        btn.disabled = false;
    }
}

// Cek apakah pengguna sudah login sebelumnya
async function cekSesiAktif() {
    try {
        const { data: { session } } = await supabaseAuth.auth.getSession();
        if (session) {
            const role = localStorage.getItem('user_role');
            if (role === 'warga') window.location.href = "warga.html";
            else if (role) window.location.href = "dashboard-master.html";
        }
    } catch (err) {
        console.error("Gagal mengecek sesi aktif:", err);
    }
}

// Jalankan cek sesi
cekSesiAktif();