// app/api/nilai/route.ts
// GET  /api/nilai?siswa=ID&guru=ID  |  POST /api/nilai (dipakai guru buat input nilai manual)
import connectDB from "@/lib/mongodb";
import Nilai from "@/models/Nilai";

export async function GET(request: Request) {
  try {
    await connectDB();
    const sp = new URL(request.url).searchParams;
    const siswa = sp.get("siswa");
    const guru = sp.get("guru");

    const filter: any = {};
    if (siswa) filter.siswa = siswa;
    if (guru) filter.guru = guru;

    const data = await Nilai.find(filter)
      .populate("siswa", "nama kelas")
      .sort({ createdAt: -1 });
    return Response.json({ success: true, data });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const baru = await Nilai.create(await request.json());
    return Response.json({ success: true, data: baru }, { status: 201 });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}