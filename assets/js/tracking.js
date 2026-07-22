// assets/js/tracking.js

function cekStatus(event) {
    event.preventDefault(); // Mencegah halaman refresh
    
    // Mengambil nilai input dan mengubahnya jadi huruf besar semua
    const noTiket = document.getElementById('no_tiket').value.toUpperCase();
    const hasilTracking = document.getElementById('hasil-tracking');
    
    // Simulasi pengecekan database (Data Dummy)
    if(noTiket === "PMH-001" || noTiket === "PMH-20260718-0001") {
        // Jika nomor benar, tampilkan kotak hasil
        hasilTracking.style.display = "block";
    } else {
        // Jika nomor salah
        hasilTracking.style.display = "none";
        alert("Mohon maaf, nomor permohonan " + noTiket + " tidak ditemukan di sistem. Pastikan penulisan sudah benar.");
    }
}
