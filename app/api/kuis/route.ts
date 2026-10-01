// app/api/kuis/route.ts
// GET /api/kuis?kelas=X&siswa=ID -> daftar kuis aktif utk kelas itu + status pengerjaan siswa
// POST /api/kuis -> buat kuis baru (dipakai guru nanti)
import connectDB from "@/lib/mongodb";
import Kuis from "@/models/Kuis";

export async function GET(request: Request) {
  try {
    await connectDB();
    const sp = new URL(request.url).searchParams;
    const kelas = sp.get("kelas");
    const siswa = sp.get("siswa");

    const list: any[] = await Kuis.find({ ...(kelas ? { kelas } : {}), status: "aktif" })
      .populate("guru", "nama")
      .sort({ createdAt: -1 })
      .lean();

    const data = list.map(({ attempts = [], soal = [], ...k }: any) => {
      const punyaku = siswa ? attempts.find((a: any) => String(a.siswa) === siswa) : null;
      return {
        ...k,
        jumlahSoal: soal.length,
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