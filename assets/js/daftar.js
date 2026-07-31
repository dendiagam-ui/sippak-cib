async function prosesDaftar(event) {
    event.preventDefault();

    const nik = document.getElementById('regNik').value;
    const nama = document.getElementById('regNama').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const btn = document.getElementById('btnDaftar');

    const teksAsli = btn.innerHTML;
    btn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Memproses...";
    btn.disabled = true;

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw new Error("Pendaftaran Auth Gagal: " + authError.message);

        const dataProfil = {
            id: authData.user.id,
            email: email,
            nama_lengkap: nama,
            nik: nik,
            role: 'warga'
        };

        const { error: profileError } = await supabase.from('profiles').insert([dataProfil]);
        
        if (profileError) {
            // Hapus auth jika profil gagal (Mencegah akun tersangkut)
            await supabase.auth.signOut();
            throw new Error("Gagal menyimpan ke tabel profiles: " + profileError.message);
        }

        alert("🎉 Pendaftaran Berhasil!\n\nSilakan cek KOTAK MASUK atau folder SPAM email Anda untuk verifikasi.");
        window.location.href = "login.html";

    } catch (err) {
        let pesanUser = err.message;
        if (pesanUser.includes("already registered")) pesanUser = "Email ini sudah terdaftar.";
        
        lacakError("Pendaftaran Gagal", pesanUser, err);
        btn.innerHTML = teksAsli;
        btn.disabled = false;
    }
}