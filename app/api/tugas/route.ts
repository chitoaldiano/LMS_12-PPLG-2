// app/api/tugas/route.ts
// GET /api/tugas?kelas=X&siswa=ID&guru=ID -> tugas + status pengumpulan siswa (kalau siswa diisi)
// POST /api/tugas -> buat tugas baru (guru)
import connectDB from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import User from "@/models/User";

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

    const list: any[] = await Tugas.find(filter)
      .populate("guru", "nama")
      .sort({ deadline: 1 })
      .lean();
    const data = list.map(({ submissions = [], ...t }: any) => ({
      ...t,
      jumlahKumpul: submissions.length,
      pengumpulan: siswa ? submissions.find((s: any) => String(s.siswa) === siswa) || null : null,
    }));
    return Response.json({ success: true, data });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const baru = await Tugas.create(await request.json());
    return Response.json({ success: true, data: baru }, { status: 201 });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}