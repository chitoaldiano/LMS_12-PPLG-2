// app/api/kuis/route.ts
// GET /api/kuis?kelas=X&siswa=ID&guru=ID -> daftar kuis + status pengerjaan siswa (kalau ada)
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

    const filter: any = {};
    if (kelas) filter.kelas = kelas;
    if (guru) filter.guru = guru;
    if (!guru) filter.status = "aktif"; // siswa cuma lihat yang aktif; guru lihat semua punya dia

    const list: any[] = await Kuis.find(filter)
      .populate("guru", "nama")
      .sort({ createdAt: -1 })
      .lean();

    const data = list.map(({ attempts = [], soal = [], ...k }: any) => {
      const punyaku = siswa ? attempts.find((a: any) => String(a.siswa) === siswa) : null;
      return {
        ...k,
        jumlahSoal: soal.length,
        jumlahMengerjakan: attempts.length,
        rataRata: attempts.length ? Math.round(attempts.reduce((a: number, b: any) => a + b.skor, 0) / attempts.length) : null,
        attemptSaya: punyaku ? { skor: punyaku.skor, waktuSelesai: punyaku.waktuSelesai } : null,
      };
    });

    return Response.json({ success: true, data });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const baru = await Kuis.create(await request.json());
    return Response.json({ success: true, data: baru }, { status: 201 });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}