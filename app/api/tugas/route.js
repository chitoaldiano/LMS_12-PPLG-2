// GET /api/tugas?kelas=X&siswa=ID -> tugas kelas itu + status pengumpulan siswa
// POST /api/tugas -> buat tugas (nanti dipakai guru)
import connectDB from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import User from "@/models/User";

export async function GET(request) {
  try {
    await connectDB();
    const sp = new URL(request.url).searchParams;
    const kelas = sp.get("kelas");
    const siswa = sp.get("siswa");
    const list = await Tugas.find(kelas ? { kelas } : {})
      .populate("guru", "nama")
      .sort({ deadline: 1 })
      .lean();
    const data = list.map(({ submissions = [], ...t }) => ({
      ...t,
      pengumpulan: siswa ? submissions.find((s) => String(s.siswa) === siswa) || null : null,
    }));
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const baru = await Tugas.create(await request.json());
    return Response.json({ success: true, data: baru }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}