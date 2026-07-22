// assets/js/validation.js

// Fungsi untuk mengecek ukuran dan format file (Maksimal 2MB)
function validasiFile(inputElement) {
    const batasUkuran = 2 * 1024 * 1024; // 2 MB dalam Bytes
    
    if (inputElement.files && inputElement.files[0]) {
        const file = inputElement.files[0];
        const ukuranFile = file.size;
        
        if (ukuranFile > batasUkuran) {
            alert(`Peringatan: Ukuran file "${file.name}" terlalu besar!\nMaksimal ukuran yang diizinkan adalah 2 MB.`);
            inputElement.value = ''; // Mengosongkan input otomatis
            return false;
        }
    }
    return true;
}

// Otomatis memasang validasi ini ke semua input bertipe file di halaman
document.addEventListener("DOMContentLoaded", function() {
    // Gunakan event delegation karena input file di form permohonan digenerate secara dinamis
    document.body.addEventListener('change', function(event) {
        if (event.target && event.target.type === 'file') {
            validasiFile(event.target);
        }
    });
});
