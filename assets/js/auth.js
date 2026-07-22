// js/auth.js

// Fungsi untuk mengecek PIN petugas
function cekLoginPetugas(event) {
    event.preventDefault(); // Mencegah halaman refresh otomatis
    
    const pinInput = document.getElementById('pin').value;
    
    // PIN Dummy untuk sementara (nanti akan divalidasi ke database Supabase)
    const PIN_BENAR = "123456"; 
    
    if (pinInput === PIN_BENAR) {
        alert("Login Berhasil! Mengalihkan ke Dashboard...");
        window.location.href = "dashboard.html";
    } else {
        alert("PIN Salah! Silakan coba lagi.");
        document.getElementById('pin').value = ""; // Kosongkan input jika salah
    }
}
