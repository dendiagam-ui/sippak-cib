// assets/js/detail.js

const urlParams = new URLSearchParams(window.location.search);
const idPermohonan = urlParams.get('id');

let nomorWaWarga = "";
let namaWarga = "";
let jenisLayananWarga = "";
let dataPermohonanGlobal = null; // Menyimpan data lengkap untuk keperluan hapus file

async function muatDetail() {
    try {
        if (!idPermohonan) {
            document.getElementById('infoData').innerHTML = "<p style='color:red;'>Akses Tidak Valid! Harap buka detail permohonan melalui tabel di halaman Dashboard Petugas.</p>";
            document.getElementById('infoDokumen').innerHTML = "";
            return;
        }

        const { data, error } = await supabase.from('permohonan').select('*').eq('id', idPermohonan).single();

        if (error) throw error;

        dataPermohonanGlobal = data; // Simpan ke variabel global
        nomorWaWarga = data.no_wa;
        namaWarga = data.nama_pemohon;
        jenisLayananWarga = data.jenis_layanan;

        // 1. TAMPILKAN DATA TEKS PEMOHON
        let htmlData = `
            <strong>Nomor Tiket:</strong> ${data.nomor_tiket} <br>
            <strong>Layanan:</strong> ${data.jenis_layanan} <br><br>
            <strong>DATA PEMOHON:</strong><br>
            - NIK: ${data.nik} <br>
            - No KK: ${data.no_kk || '-'} <br>
            - Nama: ${data.nama_pemohon} <br>
            - WhatsApp: ${data.no_wa} <br>
            - Email: ${data.email || '-'} <br>
        `;

        if(data.keterangan) {
            htmlData += `<br><strong>Keterangan:</strong> ${data.keterangan}<br>`;
        }
        if(data.nik_pengajuan) {
            htmlData += `<br><strong>DATA PENGAJUAN:</strong><br>- NIK: ${data.nik_pengajuan}<br>- Nama: ${data.nama_pengajuan}<br>- Alasan: ${data.alasan_pengajuan || '-'}<br>`;
        }
        if(data.alamat_asal) {
            htmlData += `<br><strong>DATA PINDAH:</strong><br>- Alamat Asal: ${data.alamat_asal}<br>- Alamat Tujuan: ${data.alamat_tujuan}<br>- Alasan: ${data.alasan_pindah}<br><br>`;
            if (data.data_pindah_keluarga) {
                let daftarKeluarga = data.data_pindah_keluarga.replace(/\n/g, '<br>');
                htmlData += `<strong>ANGGOTA YANG PINDAH:</strong><br><span style="font-size:13px; line-height:1.4;">${daftarKeluarga}</span><br>`;
            }
        }
        
        htmlData += `<br><strong>Status Saat Ini:</strong> <span style="color: blue; font-weight: bold;">${data.status}</span>`;
        document.getElementById('infoData').innerHTML = htmlData;

        // 2. TAMPILKAN TOMBOL DOKUMEN YANG DI UPLOAD WARGA
        let htmlDok = '';
        if(data.dokumen_tambahan) htmlDok += `<a href="${data.dokumen_tambahan}" target="_blank" class="tombol-dok">📄 Dok. Tambahan</a> `;
        if(data.file_kk_hilang) htmlDok += `<a href="${data.file_kk_hilang}" target="_blank" class="tombol-dok">📄 Surat Kehilangan</a> `;
        if(data.file_ktp) htmlDok += `<a href="${data.file_ktp}" target="_blank" class="tombol-dok">📄 KTP (Pemohon/Hilang)</a> `;
        if(data.file_kk) htmlDok += `<a href="${data.file_kk}" target="_blank" class="tombol-dok">📄 Kartu Keluarga</a> `;
        if(data.file_f106) htmlDok += `<a href="${data.file_f106}" target="_blank" class="tombol-dok">📄 Formulir F1.06</a> `;
        
        if(htmlDok === '') htmlDok = '<i>Tidak ada lampiran dokumen.</i>';
        document.getElementById('infoDokumen').innerHTML = htmlDok;

        // 3. SET NILAI AWAL FORM TINDAKAN
        document.getElementById('statusDropdown').value = data.status;
        document.getElementById('inputDokumen').value = data.link_dokumen || "";
        document.getElementById('inputAlasanTolak').value = data.alasan_penolakan || "";
        
        cekStatusTolak();

    } catch (err) {
        document.getElementById('infoData').innerHTML = `<p style='color:red;'>Terjadi kesalahan saat memuat data: ${err.message}</p>`;
        document.getElementById('infoDokumen').innerHTML = `<i>Gagal memuat dokumen.</i>`;
    }
}

function cekStatusTolak() {
    const stat = document.getElementById('statusDropdown').value;
    document.getElementById('grupTolak').style.display = (stat === 'Ditolak') ? 'block' : 'none';
    document.getElementById('grupDokumenSelesai').style.display = (stat === 'Selesai') ? 'block' : 'none';
}

async function simpanPerubahan() {
    const statusBaru = document.getElementById('statusDropdown').value;
    const dokumenBaru = document.getElementById('inputDokumen').value;
    const alasanBaru = document.getElementById('inputAlasanTolak').value;

    if (statusBaru === 'Ditolak' && !alasanBaru) {
        alert("Harap isi alasan penolakan terlebih dahulu!");
        return;
    }

    const { error } = await supabase.from('permohonan').update({ 
        status: statusBaru,
        link_dokumen: dokumenBaru,
        alasan_penolakan: (statusBaru === 'Ditolak') ? alasanBaru : null
    }).eq('id', idPermohonan);

    if (error) {
        alert("Gagal menyimpan: " + error.message);
    } else {
        alert("Data permohonan berhasil diperbarui!");
        
        let pesan = '';
        if (statusBaru === 'Selesai') {
            pesan = `Halo ${namaWarga}, permohonan Anda (${jenisLayananWarga}) telah berstatus SELESAI. Silakan cek aplikasi untuk informasi atau dokumen hasil.`;
        } else if (statusBaru === 'Ditolak') {
            pesan = `Halo ${namaWarga}, mohon maaf permohonan Anda (${jenisLayananWarga}) DITOLAK.\n\nAlasan: ${alasanBaru}\n\nSilakan cek aplikasi untuk melakukan perbaikan.`;
        }
        
        if (pesan !== '') {
            window.open(`https://wa.me/${nomorWaWarga}?text=${encodeURIComponent(pesan)}`, '_blank');
        } else {
            window.location.href = "dashboard.html";
        }
    }
}

// --- FITUR BARU: HAPUS PERMANEN (BERSIHKAN STORAGE & DATABASE) ---
async function hapusPermohonan() {
    // Konfirmasi ganda agar petugas tidak salah klik
    const konfirmasi = confirm("⚠️ PERINGATAN KERAS!\n\nApakah Anda yakin ingin menghapus permohonan ini secara permanen?\nData teks dan seluruh file dokumen yang diunggah warga di Storage akan ikut musnah dan tidak dapat dikembalikan.");
    
    if (!konfirmasi) return;

    try {
        if (!dataPermohonanGlobal) {
            alert("Data belum dimuat sempurna.");
            return;
        }

        // 1. KUMPULKAN NAMA FILE DARI URL SUPABASE STORAGE
        // URL Supabase biasanya berformat: .../storage/v1/object/public/syarat_permohonan/NAMA_FILE
        let daftarFileYangDihapus = [];
        
        const kumpulLink = [
            dataPermohonanGlobal.dokumen_tambahan,
            dataPermohonanGlobal.file_kk_hilang,
            dataPermohonanGlobal.file_ktp,
            dataPermohonanGlobal.file_kk,
            dataPermohonanGlobal.file_f106
        ];

        kumpulLink.forEach(link => {
            if (link && link.includes('syarat_permohonan/')) {
                // Ambil string setelah folder 'syarat_permohonan/'
                let namaFile = link.split('syarat_permohonan/')[1];
                if (namaFile) {
                    daftarFileYangDihapus.push(namaFile);
                }
            }
        });

        // 2. HAPUS FILE FISIK DARI STORAGE SUPABASE (Jika ada)
        if (daftarFileYangDihapus.length > 0) {
            const { error: errorStorage } = await supabase.storage
                .from('syarat_permohonan')
                .remove(daftarFileYangDihapus);

            if (errorStorage) {
                console.warn("Catatan: Gagal menghapus file fisik di storage, tapi proses database akan dilanjutkan:", errorStorage.message);
            }
        }

        // 3. HAPUS BARIS DATA DARI TABEL 'permohonan'
        const { error: errorDb } = await supabase
            .from('permohonan')
            .delete()
            .eq('id', idPermohonan);

        if (errorDb) throw errorDb;

        alert("🗑️ Data dan seluruh file dokumen berhasil dihapus permanen! Space database & storage telah dibersihkan.");
        window.location.href = "dashboard.html";

    } catch (err) {
        alert("Gagal menghapus permohonan: " + err.message);
    }
}

// Jalankan saat file terbuka
muatDetail();