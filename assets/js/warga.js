// assets/js/warga.js

// 1. FUNGSI UNTUK MENGUMPULKAN DATA & MENAMPILKAN POPUP
// REVISI: Fungsi ini sekarang menjadi 'async' karena butuh waktu bertanya ke database
async function tampilkanRingkasan(event) {
    event.preventDefault(); // Cegah web reload
    
    const jenisLayanan = document.getElementById('jenis_layanan').value;
    const nik = document.getElementById('nik').value;

    // Ubah teks tombol sementara agar warga tahu sistem sedang bekerja
    const btnUtama = document.getElementById('btnUtama');
    const teksTombolAsli = btnUtama.innerHTML;
    btnUtama.innerHTML = "⏳ Memeriksa Data...";
    btnUtama.disabled = true;

    try {
        // --- FITUR BARU: CEK PENGAJUAN GANDA (ANTI-SPAM) ---
        // Cari data dengan NIK yang sama, Layanan yang sama, dan Status yang belum selesai
        const { data: cekData, error: cekError } = await supabase
            .from('permohonan')
            .select('status')
            .eq('nik', nik)
            .eq('jenis_layanan', jenisLayanan)
            .in('status', ['Menunggu Verifikasi', 'Diproses']);

        if (cekError) throw cekError;

        // Jika ditemukan data yang nyangkut (belum Selesai/Ditolak)
        if (cekData && cekData.length > 0) {
            alert(`⚠️ MAAF! Anda masih memiliki pengajuan "${jenisLayanan}" yang sedang diproses.\n\nAnda baru bisa mengajukan permohonan layanan ini kembali jika status sebelumnya sudah "Selesai" atau "Ditolak".\n\nSilakan cek menu Lacak Status untuk melihat perkembangan dokumen Anda.`);
            return; // Hentikan fungsi di sini, jangan munculkan popup
        }

        // --- JIKA LOLOS PENGECEKAN, LANJUTKAN TAMPILKAN POPUP ---
        const nama = document.getElementById('nama').value;
        const noWa = document.getElementById('no_wa').value;
        
        let html = `<strong>Jenis Layanan:</strong> <span style="color:#0056b3;">${jenisLayanan}</span><hr style="margin: 8px 0; border:0; border-top:1px solid #ccc;">`;
        html += `<strong>DATA PEMOHON:</strong><br>`;
        html += `- NIK: ${nik}<br>`;
        html += `- Nama: ${nama}<br>`;
        html += `- WhatsApp: ${noWa}<br><br>`;

        if (jenisLayanan === 'Cetak Ulang KTP-El') {
            html += `<strong>PENGAJUAN KTP:</strong><br>`;
            html += `- NIK: ${document.getElementById('nik_pengajuan').value}<br>`;
            html += `- Nama: ${document.getElementById('nama_pengajuan').value}<br>`;
            html += `- Alasan: ${document.getElementById('alasan_pengajuan').value}<br>`;
        } 
        else if (jenisLayanan === 'Perbaikan Data') {
            html += `<strong>PERBAIKAN DATA:</strong><br>`;
            html += `- NIK: ${document.getElementById('nik_perbaikan').value}<br>`;
            html += `- Nama: ${document.getElementById('nama_perbaikan').value}<br>`;
            html += `- Ket: ${document.getElementById('keterangan_perbaikan').value}<br>`;
        }
        else if (jenisLayanan === 'Pindah Keluar') {
            html += `<strong>PINDAH KELUAR:</strong><br>`;
            html += `- Tujuan: ${document.getElementById('alamat_tujuan').value}<br>`;
            html += `- Jml Orang: ${document.getElementById('jumlah_pindah').value} Orang<br>`;
        }

        html += `<br><i style="color:green; font-size: 12px;">*Dokumen persyaratan telah dilampirkan.</i>`;

        document.getElementById('isiRingkasan').innerHTML = html;
        document.getElementById('modalRingkasan').style.display = 'flex';

    } catch (err) {
        alert("Terjadi kesalahan saat memeriksa database: " + err.message);
    } finally {
        // Kembalikan tombol biru seperti semula
        btnUtama.innerHTML = teksTombolAsli;
        btnUtama.disabled = false;
    }
}

// 2. FUNGSI UNTUK MENUTUP POPUP (Batal)
function tutupModal() {
    document.getElementById('modalRingkasan').style.display = 'none';
}

// 3. FUNGSI EKSEKUSI PENGIRIMAN KE DATABASE SUPABASE
async function prosesKirimAkhir() {
    const btnKonfirmasi = document.getElementById('btnKonfirmasi');
    const teksAsli = btnKonfirmasi.innerHTML;
    
    btnKonfirmasi.innerHTML = "⏳ Mengunggah...";
    btnKonfirmasi.disabled = true;

    try {
        const jenisLayanan = document.getElementById('jenis_layanan').value;
        let urlKkHilang = null, urlDokumenTambahan = null, urlFileKtp = null, urlFileKk = null, urlF106 = null;

        async function uploadKeSupabase(elemenInput, prefixNama) {
            if (elemenInput && elemenInput.files.length > 0) {
                const file = elemenInput.files[0];
                const namaUnik = Date.now() + '_' + prefixNama + '_' + file.name.replace(/\s+/g, '_'); 
                const { error } = await supabase.storage.from('syarat_permohonan').upload(namaUnik, file);
                if (error) throw error;
                const { data } = supabase.storage.from('syarat_permohonan').getPublicUrl(namaUnik);
                return data.publicUrl;
            }
            return null;
        }

        let stringAnggotaPindah = null;
        if (jenisLayanan === 'Pindah Keluar') {
            const jumlahOrang = parseInt(document.getElementById('jumlah_pindah').value) || 0;
            let arrayKeluarga = [];
            for (let i = 1; i <= jumlahOrang; i++) {
                const nikAnggota = document.getElementById('nik_anggota_' + i).value;
                const namaAnggota = document.getElementById('nama_anggota_' + i).value;
                const statusAnggota = document.getElementById('status_anggota_' + i).value;
                arrayKeluarga.push(`[${i}] NIK: ${nikAnggota} | Nama: ${namaAnggota} | Status: ${statusAnggota}`);
            }
            stringAnggotaPindah = arrayKeluarga.join('\n'); 
        }

        if (jenisLayanan === 'Cetak Kartu Keluarga') {
            urlKkHilang = await uploadKeSupabase(document.getElementById('file_kk_hilang'), 'KK');
            urlDokumenTambahan = await uploadKeSupabase(document.getElementById('dokumen_tambahan'), 'TAMBAHAN');
        } 
        else if (jenisLayanan === 'Cetak Ulang KTP-El') {
            urlFileKtp = await uploadKeSupabase(document.getElementById('file_ktp'), 'KTP');
            urlFileKk = await uploadKeSupabase(document.getElementById('file_kk'), 'KTP_KK');
        }
        else if (jenisLayanan === 'Perbaikan Data') {
            urlF106 = await uploadKeSupabase(document.getElementById('file_f106'), 'F106');
            urlDokumenTambahan = await uploadKeSupabase(document.getElementById('dokumen_tambahan_perbaikan'), 'TAMBAHAN');
        }
        else if (jenisLayanan === 'Pindah Keluar') {
            urlFileKk = await uploadKeSupabase(document.getElementById('file_kk_pindah'), 'PINDAH_KK');
            urlFileKtp = await uploadKeSupabase(document.getElementById('file_ktp_pindah'), 'PINDAH_KTP');
        }

        const dataPermohonan = {
            nomor_tiket: 'PMH-' + Date.now(),
            jenis_layanan: jenisLayanan,
            nik: document.getElementById('nik').value,
            no_kk: document.getElementById('no_kk').value,
            nama_pemohon: document.getElementById('nama').value,
            no_wa: document.getElementById('no_wa').value,
            email: document.getElementById('email').value,
            status: 'Menunggu Verifikasi', 
            
            keterangan: (jenisLayanan === 'Cetak Kartu Keluarga') ? document.getElementById('keterangan').value : ((jenisLayanan === 'Perbaikan Data') ? document.getElementById('keterangan_perbaikan').value : null),
            nik_pengajuan: (jenisLayanan === 'Cetak Ulang KTP-El') ? document.getElementById('nik_pengajuan').value : ((jenisLayanan === 'Perbaikan Data') ? document.getElementById('nik_perbaikan').value : null),
            nama_pengajuan: (jenisLayanan === 'Cetak Ulang KTP-El') ? document.getElementById('nama_pengajuan').value : ((jenisLayanan === 'Perbaikan Data') ? document.getElementById('nama_perbaikan').value : null),
            alasan_pengajuan: (jenisLayanan === 'Cetak Ulang KTP-El') ? document.getElementById('alasan_pengajuan').value : null,
            
            alamat_asal: (jenisLayanan === 'Pindah Keluar') ? document.getElementById('alamat_asal').value : null,
            alamat_tujuan: (jenisLayanan === 'Pindah Keluar') ? document.getElementById('alamat_tujuan').value : null,
            alasan_pindah: (jenisLayanan === 'Pindah Keluar') ? document.getElementById('alasan_pindah').value : null,
            data_pindah_keluarga: stringAnggotaPindah,

            file_kk_hilang: urlKkHilang,
            file_ktp: urlFileKtp,
            file_kk: urlFileKk,
            file_f106: urlF106,
            dokumen_tambahan: urlDokumenTambahan 
        };

        const { error: dbError } = await supabase.from('permohonan').insert([dataPermohonan]);
        if (dbError) throw dbError;

        alert("BERHASIL! Data telah terkirim.\n\nSilakan lacak permohonan Anda menggunakan NIK di halaman selanjutnya.");
        window.location.href = "status.html"; 

    } catch (err) {
        alert("Gagal mengirim data: " + err.message);
        btnKonfirmasi.innerHTML = teksAsli;
        btnKonfirmasi.disabled = false;
        tutupModal(); 
    } 
}