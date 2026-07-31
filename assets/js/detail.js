<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Permohonan | SIPPAK-CIB</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, sans-serif; }
        body { background-color: #f4f7f6; padding: 20px; color: #333; }
        .container { max-width: 800px; margin: 0 auto; }
        
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .btn-back { text-decoration: none; color: #0056b3; font-weight: bold; font-size: 16px; }
        .btn-back:hover { text-decoration: underline; }
        
        .card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .card h3 { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; color: #0056b3; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 15px 10px; font-size: 15px; }
        .info-label { font-weight: bold; color: #666; }
        .info-value { color: #111; }
        
        .badge { padding: 8px 12px; border-radius: 5px; font-size: 14px; font-weight: bold; display: inline-block; }
        .badge-menunggu { background: #ffc107; color: #856404; }
        .badge-proses { background: #17a2b8; color: white; }
        .badge-selesai { background: #28a745; color: white; }
        .badge-ditolak { background: #dc3545; color: white; }

        .btn-group { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
        .btn { padding: 12px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; color: white; font-size: 14px; flex: 1; min-width: 150px; text-align: center; }
        .btn-proses { background: #17a2b8; }
        .btn-selesai { background: #28a745; }
        .btn-tolak { background: #dc3545; }
        
        /* Gaya Khusus untuk Tombol Dokumen */
        .dokumen-list { display: flex; flex-direction: column; gap: 10px; }
        .btn-dokumen { 
            display: inline-flex; align-items: center; gap: 8px; background: #e8f4fd; 
            color: #0056b3; padding: 12px 20px; border-radius: 8px; text-decoration: none; 
            font-weight: bold; border: 1px solid #b8daff; transition: 0.3s;
        }
        .btn-dokumen:hover { background: #0056b3; color: white; }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <a href="dashboard-master.html" class="btn-back"><i class="fas fa-arrow-left"></i> Kembali ke Dasbor</a>
        </div>

        <div id="loader" style="text-align: center; margin-top: 50px; font-size: 18px; color: #666;">
            <i class="fas fa-spinner fa-spin"></i> Sedang mengambil data permohonan...
        </div>

        <div id="kontenDetail" style="display: none;">
            <!-- Status & Aksi -->
            <div class="card">
                <h3>Status Permohonan</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <span class="info-label" style="display: block; margin-bottom: 5px;">Nomor Tiket:</span>
                        <strong style="font-size: 18px;" id="valTiket">...</strong>
                    </div>
                    <div id="wadahBadge"></div>
                </div>

                <div class="btn-group" id="wadahAksi">
                    <button class="btn btn-proses" onclick="ubahStatus('Diproses')"><i class="fas fa-cog"></i> Proses Berkas</button>
                    <button class="btn btn-selesai" onclick="ubahStatus('Selesai')"><i class="fas fa-check-circle"></i> Tandai Selesai</button>
                    <button class="btn btn-tolak" onclick="ubahStatus('Ditolak')"><i class="fas fa-times-circle"></i> Tolak/Berkas Kurang</button>
                </div>
            </div>

            <!-- Biodata -->
            <div class="card">
                <h3>Biodata Pemohon</h3>
                <div class="info-grid">
                    <div class="info-label">NIK</div><div class="info-value" id="valNik">...</div>
                    <div class="info-label">Nama Lengkap</div><div class="info-value" id="valNama">...</div>
                    <div class="info-label">Nomor KK</div><div class="info-value" id="valKK">...</div>
                    <div class="info-label">No. WhatsApp</div><div class="info-value" id="valWa">...</div>
                    <div class="info-label">Email</div><div class="info-value" id="valEmail">...</div>
                    <div class="info-label">Waktu Pengajuan</div><div class="info-value" id="valTanggal">...</div>
                </div>
            </div>

            <!-- Detail Layanan -->
            <div class="card">
                <h3>Detail Layanan</h3>
                <div class="info-grid">
                    <div class="info-label">Jenis Layanan</div>
                    <div class="info-value"><strong id="valLayanan" style="color: #0056b3;">...</strong></div>
                    <div class="info-label">Keterangan / Alasan</div>
                    <div class="info-value" id="valKeterangan">...</div>
                </div>
            </div>

            <!-- DOKUMEN LAMPIRAN (FITUR BARU) -->
            <div class="card">
                <h3><i class="fas fa-folder-open"></i> Dokumen Persyaratan</h3>
                <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Klik tombol di bawah untuk melihat file yang diunggah warga.</p>
                
                <div class="dokumen-list" id="valDokumen">
                    <!-- Tombol dokumen akan muncul di sini otomatis -->
                </div>
            </div>
        </div>
    </div>

    <!-- Panggil Supabase -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="../assets/js/config.js"></script>

    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const permohonanId = urlParams.get('id');

        async function muatDetail() {
            const loader = document.getElementById('loader');
            
            try {
                // Cek Sesi
                const { data: { session } } = await supabase.auth.getSession();
                const role = localStorage.getItem('user_role');
                
                if (!session || (role !== 'petugas' && role !== 'superadmin')) {
                    throw new Error("Akses ditolak. Silakan login sebagai Petugas.");
                }

                if (!permohonanId) {
                    throw new Error("ID Permohonan tidak valid.");
                }

                // Ambil data
                const { data, error } = await supabase.from('permohonan').select('*').eq('id', permohonanId).single();

                if (error) throw error;

                // Masukkan teks ke HTML
                document.getElementById('valTiket').innerText = data.nomor_tiket || '-';
                document.getElementById('valNik').innerText = data.nik || '-';
                document.getElementById('valNama').innerText = data.nama_pemohon || '-';
                document.getElementById('valKK').innerText = data.no_kk || '-';
                document.getElementById('valWa').innerText = data.no_wa || '-';
                document.getElementById('valEmail').innerText = data.email || '-';
                document.getElementById('valLayanan').innerText = data.jenis_layanan || '-';
                document.getElementById('valKeterangan').innerText = data.keterangan || data.alasan_pindah || '-';
                document.getElementById('valTanggal').innerText = data.created_at ? new Date(data.created_at).toLocaleString('id-ID') : '-';

                aturBadgeStatus(data.status || 'Menunggu');

                // --- LOGIKA MENAMPILKAN TOMBOL DOKUMEN ---
                const wadahDokumen = document.getElementById('valDokumen');
                wadahDokumen.innerHTML = ''; // Kosongkan dulu
                let adaDokumen = false;

                if (data.file_lampiran) {
                    wadahDokumen.innerHTML += `
                        <a href="${data.file_lampiran}" target="_blank" class="btn-dokumen">
                            <i class="fas fa-file-pdf"></i> Lihat Lampiran Utama (KTP/KK)
                        </a>`;
                    adaDokumen = true;
                }
                
                if (data.file_lampiran_2) {
                    wadahDokumen.innerHTML += `
                        <a href="${data.file_lampiran_2}" target="_blank" class="btn-dokumen">
                            <i class="fas fa-file-alt"></i> Lihat Dokumen Tambahan
                        </a>`;
                    adaDokumen = true;
                }

                // Jika warga tidak mengunggah apa pun
                if (!adaDokumen) {
                    wadahDokumen.innerHTML = `<div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; border: 1px solid #ffeeba;">Warga tidak melampirkan dokumen apa pun pada permohonan ini.</div>`;
                }

                // Tampilkan layar
                loader.style.display = 'none';
                document.getElementById('kontenDetail').style.display = 'block';

            } catch (err) {
                loader.innerHTML = `<div style="color:red;">Gagal memuat data: ${err.message}</div>`;
            }
        }

        function aturBadgeStatus(status) {
            let kelas = 'badge-menunggu';
            if (status === 'Diproses') kelas = 'badge-proses';
            else if (status === 'Selesai') kelas = 'badge-selesai';
            else if (status === 'Ditolak') kelas = 'badge-ditolak';
            document.getElementById('wadahBadge').innerHTML = `<span class="badge ${kelas}"><i class="fas fa-info-circle"></i> Status: ${status}</span>`;
        }

        async function ubahStatus(statusBaru) {
            const konfirmasi = confirm(`Ubah status menjadi: ${statusBaru}?`);
            if (!konfirmasi) return;
            try {
                const { error } = await supabase.from('permohonan').update({ status: statusBaru }).eq('id', permohonanId);
                if (error) throw error;
                aturBadgeStatus(statusBaru); 
                alert(`Status diperbarui menjadi: ${statusBaru}`);
            } catch (err) {
                alert("Gagal mengubah status.");
            }
        }

        muatDetail();
    </script>
</body>
</html>