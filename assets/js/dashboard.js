// assets/js/dashboard.js

async function ambilData() {
    // 1. Ambil nilai filter yang dipilih petugas
    const filterValue = document.getElementById('filterStatus').value;
    
    // 2. Siapkan perintah untuk mengambil data dari Supabase
    let query = supabase.from('permohonan').select('id, nomor_tiket, nama_pemohon, status').order('created_at', { ascending: false });

    // 3. Jika filter bukan "Semua", saring data berdasarkan status
    if (filterValue !== 'Semua') {
        query = query.eq('status', filterValue);
    }

    const { data, error } = await query;

    if (error) {
        alert("Gagal memuat data: " + error.message);
        return;
    }

    const tbody = document.getElementById('isiTabel');
    tbody.innerHTML = ''; 

    // Jika data kosong
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px;">Tidak ada permohonan.</td></tr>';
        return;
    }

    // 4. Masukkan data ke dalam tabel
    data.forEach(item => {
        // Beri warna status agar petugas mudah membedakan
        let warnaStatus = 'black';
        if(item.status === 'Menunggu Verifikasi') warnaStatus = 'orange';
        if(item.status === 'Diproses') warnaStatus = 'blue';
        if(item.status === 'Selesai') warnaStatus = 'green';

        tbody.innerHTML += `
            <tr>
                <td style="padding: 10px;">${item.nomor_tiket}</td>
                <td style="padding: 10px;">${item.nama_pemohon}</td>
                <td style="padding: 10px; color: ${warnaStatus}; font-weight: bold;">${item.status}</td>
                <td style="padding: 10px;">
                    <!-- Tombol untuk menuju halaman Detail Permohonan -->
                    <a href="detail.html?id=${item.id}" style="padding: 6px 12px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
                        📄 Lihat Detail
                    </a>
                </td>
            </tr>
        `;
    });
}

// Jalankan fungsi saat halaman dashboard dibuka
ambilData();