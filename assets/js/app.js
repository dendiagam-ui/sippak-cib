// assets/js/app.js

// Mendaftarkan Service Worker untuk fitur PWA (Bisa diinstal & akses offline dasar)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Path menyesuaikan karena file HTML kita ada yang di root dan di folder pages/
        // Kita arahkan pendaftaran ke root directory
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('PWA: Service Worker berhasil didaftarkan!', registration.scope);
            })
            .catch(error => {
                console.log('PWA: Service Worker gagal didaftarkan:', error);
            });
    });
}
