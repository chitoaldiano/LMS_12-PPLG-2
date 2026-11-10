// scripts/seed.mjs
// Mengisi database dengan DATA CONTOH lewat API aplikasi (password otomatis di-hash).
//
// Cara pakai:
//   1. Pastikan MongoDB jalan dan server aplikasi jalan:  npm run dev
//   2. Di terminal LAIN (folder project):                  node scripts/seed.mjs
//
// Skrip berhenti sendiri kalau database sudah berisi guru/siswa, jadi aman kalau
// tidak sengaja dijalankan dua kali.

const BASE = process.env.BASE_URL || "http://localhost:3000";

async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    // respons bukan JSON
  }
  return { ok: res.ok, status: res.status, json };
}

async function wajib(label, method, path, body) {
  const r = await api(method, path, body);
  if (!r.ok || !r.json?.success) {
    console.error(`GAGAL  ${label}: ${r.json?.message || "HTTP " + r.status}`);
    process.exit(1);
  }
  console.log(`ok     ${label}`);
  return r.json.data;
}

async function main() {
  // 0. Pastikan server hidup & database masih kosong
  let semuaUser;
  try {
    const cek = await api("GET", "/api/users");
    if (!cek.json?.success) throw new Error("respons tidak valid");
    semuaUser = cek.json.data;
  } catch {
    console.error(`Tidak bisa menyambung ke ${BASE}. Jalankan "npm run dev" dulu di terminal lain.`);
    process.exit(1);
  }

  if (semuaUser.some((u) => u.role !== "admin")) {
    console.log("Database sudah berisi data (ada guru/siswa/dll). Seed dibatalkan supaya tidak dobel.");
    process.exit(0);
  }

  // 1. Admin (dilewati kalau sudah ada)
  if (!semuaUser.some((u) => u.role === "admin")) {
    await wajib("Admin admin1", "POST", "/api/users/register", {
      nama: "Admin Sekolah",
      username: "admin1",
      password: "admin123",
      role: "admin",
    });
  } else {
    console.log("skip   Admin sudah ada");
  }

  // 2. Guru
  const budi = await wajib("Guru Budi Santoso", "POST", "/api/users/register", {
    nama: "Budi Santoso",
    email: "budi@sekolah.com",
    password: "guru123",
    role: "guru",
    mataPelajaran: ["Matematika"],
    noTelepon: "081200000001",
    jenisKelamin: "Laki-laki",
    alamat: "Jakarta",
    status: "Aktif",
  });
  const sari = await wajib("Guru Sari Wulandari", "POST", "/api/users/register", {
    nama: "Sari Wulandari",
    email: "sari@sekolah.com",
    password: "guru123",
    role: "guru",
    mataPelajaran: ["Pemrograman Dasar"],
    noTelepon: "081200000002",
    jenisKelamin: "Perempuan",
    alamat: "Jakarta",
    status: "Aktif",
  });

  // 3. Kepala Sekolah & Kurikulum
  await wajib("Kepala Sekolah", "POST", "/api/users/register", {
    nama: "Ahmad Fauzi",
    nip: "196501011990031001",
    password: "kepsek123",
    role: "kepsek",
  });
  await wajib("Kurikulum", "POST", "/api/users/register", {
    nama: "Rina Kurikulum",
    email: "kurikulum@sekolah.com",
    password: "kurikulum123",
    role: "kurikulum",
  });

  // 4. Kelas
  await wajib("Kelas X PPLG 1", "POST", "/api/kelas", {
    namaKelas: "X PPLG 1",
    tingkat: "X",
    jurusan: "PPLG",
    tahunAjaran: "2026/2027",
    kapasitas: 36,
    waliKelas: budi._id,
  });
  await wajib("Kelas XI PPLG 1", "POST", "/api/kelas", {
    namaKelas: "XI PPLG 1",
    tingkat: "XI",
    jurusan: "PPLG",
    tahunAjaran: "2026/2027",
    kapasitas: 36,
    waliKelas: sari._id,
  });

  // 5. Siswa
  const dataSiswa = [
    ["Siti Aisyah", "1001", "0012345001", "X PPLG 1", "Perempuan"],
    ["Rudi Hartono", "1002", "0012345002", "X PPLG 1", "Laki-laki"],
    ["Dewi Lestari", "1003", "0012345003", "X PPLG 1", "Perempuan"],
    ["Andi Pratama", "2001", "0012345004", "XI PPLG 1", "Laki-laki"],
  ];
  const siswa = [];
  for (const [nama, nis, nisn, kelas, jk] of dataSiswa) {
    siswa.push(
      await wajib(`Siswa ${nama}`, "POST", "/api/users/register", {
        nama,
        nis,
        nisn,
        kelas,
        jurusan: "PPLG",
        password: "siswa123",
        role: "siswa",
        noTelepon: "081300000000",
        jenisKelamin: jk,
        alamat: "Jakarta",
        status: "Aktif",
      })
    );
  }

  // 6. Materi
  await wajib("Materi Aljabar", "POST", "/api/materi", {
    judul: "Pengantar Aljabar",
    mataPelajaran: "Matematika",
    kelas: "X PPLG 1",
    tipe: "link",
    fileUrl: "https://example.com/materi-aljabar",
    guru: budi._id,
  });
  await wajib("Materi Flowchart", "POST", "/api/materi", {
    judul: "Dasar Flowchart",
    mataPelajaran: "Pemrograman Dasar",
    kelas: "X PPLG 1",
    tipe: "link",
    fileUrl: "https://example.com/materi-flowchart",
    guru: sari._id,
  });

  // 7. Tugas
  const minggu = 7 * 24 * 60 * 60 * 1000;
  const tugasBudi = await wajib("Tugas Latihan Aljabar", "POST", "/api/tugas", {
    judul: "Latihan Soal Aljabar",
    deskripsi: "Kerjakan soal halaman 10 dan kumpulkan link jawabannya.",
    mataPelajaran: "Matematika",
    kelas: "X PPLG 1",
    guru: budi._id,
    deadline: new Date(Date.now() + minggu).toISOString(),
  });
  await wajib("Tugas Flowchart", "POST", "/api/tugas", {
    judul: "Membuat Flowchart Sederhana",
    deskripsi: "Buat flowchart untuk proses login.",
    mataPelajaran: "Pemrograman Dasar",
    kelas: "X PPLG 1",
    guru: sari._id,
    deadline: new Date(Date.now() + 2 * minggu).toISOString(),
  });

  // 8. Kuis
  const kuis = await wajib("Kuis Aljabar Dasar", "POST", "/api/kuis", {
    judul: "Kuis Aljabar Dasar",
    deskripsi: "3 soal pilihan ganda.",
    mataPelajaran: "Matematika",
    kelas: "X PPLG 1",
    guru: budi._id,
    durasiMenit: 10,
    soal: [
      { pertanyaan: "Hasil dari 2x + 3 = 7 adalah ...", pilihan: ["x = 1", "x = 2", "x = 3", "x = 4"], jawabanBenar: 1 },
      { pertanyaan: "Hasil dari 10 - 4 adalah ...", pilihan: ["4", "5", "6", "7"], jawabanBenar: 2 },
      { pertanyaan: "Hasil dari 3 x 4 adalah ...", pilihan: ["7", "10", "12", "14"], jawabanBenar: 2 },
    ],
  });

  // 9. Contoh pengumpulan & nilai, supaya Rekap Nilai langsung ada isinya
  const [siti, rudi] = siswa;
  await wajib("Siti mengumpulkan tugas", "POST", `/api/tugas/${tugasBudi._id}/kumpul`, {
    siswaId: siti._id,
    fileUrl: "https://example.com/jawaban-siti",
    tipe: "link",
  });
  await wajib("Rudi mengumpulkan tugas", "POST", `/api/tugas/${tugasBudi._id}/kumpul`, {
    siswaId: rudi._id,
    fileUrl: "https://example.com/jawaban-rudi",
    tipe: "link",
  });
  await wajib("Nilai tugas Siti", "PATCH", `/api/tugas/${tugasBudi._id}/nilai`, { siswaId: siti._id, nilai: 90 });
  await wajib("Nilai tugas Rudi", "PATCH", `/api/tugas/${tugasBudi._id}/nilai`, { siswaId: rudi._id, nilai: 75 });

  await wajib("Siti mengerjakan kuis", "POST", `/api/kuis/${kuis._id}/kumpul`, {
    siswaId: siti._id,
    jawaban: [1, 2, 2],
  });
  await wajib("Rudi mengerjakan kuis", "POST", `/api/kuis/${kuis._id}/kumpul`, {
    siswaId: rudi._id,
    jawaban: [1, 0, 2],
  });

  await wajib("Nilai manual Dewi", "POST", "/api/nilai", {
    siswa: siswa[2]._id,
    guru: budi._id,
    mataPelajaran: "Matematika",
    kelas: "X PPLG 1",
    jurusan: "PPLG",
    jenis: "penilaian_manual",
    nilai: 85,
  });

  console.log(`
Selesai. Akun contoh untuk login:

  Admin          admin1                  / admin123
  Guru           budi@sekolah.com        / guru123
  Guru           sari@sekolah.com        / guru123
  Siswa          0012345001 (NISN Siti)  / siswa123
  Siswa          0012345002 (NISN Rudi)  / siswa123
  Kepala Sekolah 196501011990031001      / kepsek123
  Kurikulum      kurikulum@sekolah.com   / kurikulum123
`);
}

main().catch((err) => {
  console.error("Terjadi error:", err.message);
  process.exit(1);
});