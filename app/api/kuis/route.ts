// app/api/kuis/route.ts
// GET /api/kuis?kelas=X&siswa=ID&guru=ID -> daftar kuis
// POST /api/kuis -> buat kuis baru (guru)
import connectDB from "@/lib/mongodb";
import Kuis from "@/models/Kuis";

export async function GET(request: Request) {
  try {
    await connectDB();
    const sp = new URL(request.url).searchParams;
    const kelas = sp.get("kelas");
    const siswa = sp.get("siswa");
    const guru = sp.get("guru");

    // Jika guru ditentukan: kembalikan hanya kuis milik guru tersebut (Dashboard Guru)
    if (guru) {
      // TODO: Ganti pemeriksaan id guru dari query parameter ini dengan verifikasi sesi / JWT di server
      // saat sistem autentikasi terpusat diimplementasikan. Saat ini masih mengandalkan ID kiriman client.
      const filterGuru: any = { guru };
      if (kelas) filterGuru.kelas = kelas;

      const listGuru: any[] = await Kuis.find(filterGuru)
        .populate("guru", "nama")
        .sort({ createdAt: -1 })
        .lean();

      const dataGuru = listGuru.map(({ attempts = [], soal = [], ...k }: any) => {
        return {
          ...k,
          jumlahSoal: soal.length,
          jumlahMengerjakan: attempts.length,
          rataRata: attempts.length
            ? Math.round(attempts.reduce((a: number, b: any) => a + (b.skor ?? 0), 0) / attempts.length)
            : null,
        };
      });

      return Response.json({ success: true, data: dataGuru });
    }

    // Jika siswa atau publik: kembalikan daftar kuis aktif tanpa membocorkan nilai
    // RAHASIA: Siswa TIDAK boleh melihat skor, poin, rataRata, jumlahMengerjakan, atau pembahasan!
    const filterSiswa: any = { status: "aktif" };
    if (kelas) filterSiswa.kelas = kelas;

    const listSiswa: any[] = await Kuis.find(filterSiswa)
      .populate("guru", "nama")
      .sort({ createdAt: -1 })
      .lean();

    const dataSiswa = listSiswa.map(({ attempts = [], soal = [], ...k }: any) => {
      const punyaku = siswa ? attempts.find((a: any) => String(a.siswa) === siswa) : null;
      return {
        _id: k._id,
        judul: k.judul,
        deskripsi: k.deskripsi,
        mataPelajaran: k.mataPelajaran,
        kelas: k.kelas,
        durasiMenit: k.durasiMenit,
        guru: k.guru,
        status: k.status,
        createdAt: k.createdAt,
        jumlahSoal: soal.length,
        sudahDikerjakan: !!punyaku,
      };
    });

    return Response.json({ success: true, data: dataSiswa });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const baru = await Kuis.create(body);
    return Response.json({ success: true, data: baru }, { status: 201 });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
