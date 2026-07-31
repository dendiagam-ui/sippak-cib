let dataSementara = {};

function tampilkanRingkasan(event) {
    event.preventDefault();
    try {
        const jenisLayanan = document.getElementById('jenis_layanan').value;
        if (!jenisLayanan) throw new Error("Pilih jenis layanan terlebih dahulu.");

        let keteranganKhusus = "-";
        if (jenisLayanan === 'Cetak Kartu Keluarga') keteranganKhusus = document.getElementById('keterangan').value || '-';
        else if (jenisLayanan === 'Cetak Ulang KTP-El') keteranganKhusus = "Alasan: " + document.getElementById('alasan_pengajuan').value;
        else if (jenisLayanan === 'Perbaikan Data') keteranganKhusus = document.getElementById('keterangan_perbaikan').value || '-';
        else if (jenisLayanan === 'Pindah Keluar') keteranganKhusus = `Tujuan: ${document.getElementById('alamat_tujuan').value}`;

        dataSementara = {
            nik: document.getElementById('nik').value,
            nama_pemohon: document.getElementById('nama').value,
            no_kk: document.getElementById('no_kk').value,
            no_wa: document.getElementById('no_wa').value,
            email: document.getElementById('email').value,
            jenis_layanan: jenisLayanan,
            keterangan: keteranganKhusus,
            status: 'Menunggu',
            nomor_tiket: 'TKT-' + Date.now().toString().slice(-6)
        };

        document.getElementById('isiRingkasan').innerHTML = `
            <strong>No Tiket:</strong> ${dataSementara.nomor_tiket}<br>
            <strong>Layanan:</strong> ${dataSementara.jenis_layanan}<br>
            <strong>Pemohon:</strong> ${dataSementara.nama_pemohon}<br>
            <strong>NIK:</strong> ${dataSementara.nik}
        `;
        document.getElementById('modalRingkasan').style.display = 'flex';
    } catch (err) {
        lacakError("Validasi Form Gagal", err.message, err);
    }
}

function tutupModal() { document.getElementById('modalRingkasan').style.display = 'none'; }

async function uploadFile(fileInputId, folderName) {
    const fileInput = document.getElementById(fileInputId);
    if (!fileInput || fileInput.files.length === 0) return null;

    const file = fileInput.files[0];
    const fileName = `${folderName}/${dataSementara.nik}_${Date.now()}.${file.name.split('.').pop()}`;

    try {
        const { error } = await supabase.storage.from('berkas_warga').upload(fileName, file);
        if (error) throw error;
        
        const { data } = supabase.storage.from('berkas_warga').getPublicUrl(fileName);
        return data.publicUrl;
    } catch (err) {
        throw new Error(`Upload ${fileInputId} gagal: ${err.message}`);
    }
}

async function prosesKirimAkhir() {
    const btn = document.getElementById('btnKonfirmasi');
    btn.innerHTML = "Mengirim..."; btn.disabled = true;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) dataSementara.id_pengaju = session.user.id;

        // Proses Upload berdasarkan layanan
        if (dataSementara.jenis_layanan === 'Cetak Kartu Keluarga') {
            dataSementara.file_lampiran = await uploadFile('file_kk_hilang', 'kk');
            dataSementara.file_lampiran_2 = await uploadFile('dokumen_tambahan', 'tambahan');
        } else if (dataSementara.jenis_layanan === 'Cetak Ulang KTP-El') {
            dataSementara.file_lampiran = await uploadFile('file_ktp', 'ktp');
            dataSementara.file_lampiran_2 = await uploadFile('file_kk', 'kk');
        } else if (dataSementara.jenis_layanan === 'Perbaikan Data') {
            dataSementara.file_lampiran = await uploadFile('file_f106', 'f106');
            dataSementara.file_lampiran_2 = await uploadFile('dokumen_tambahan_perbaikan', 'tambahan');
        } else if (dataSementara.jenis_layanan === 'Pindah Keluar') {
            dataSementara.file_lampiran = await uploadFile('file_kk_pindah', 'kk');
            dataSementara.file_lampiran_2 = await uploadFile('file_ktp_pindah', 'ktp');
        }

        const { error: dbError } = await supabase.from('permohonan').insert([dataSementara]);
        if (dbError) throw new Error("Gagal menyimpan ke database: " + dbError.message);

        alert(`✅ Permohonan Terkirim!\nTiket: ${dataSementara.nomor_tiket}`);
        window.location.href = "status.html";

    } catch (err) {
        tutupModal();
        lacakError("Gagal Mengirim Permohonan", err.message, err);
        btn.innerHTML = "✅ Ya, Kirim"; btn.disabled = false;
    }
}