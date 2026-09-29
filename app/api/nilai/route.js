// GET /api/nilai?siswa=ID  |  POST /api/nilai (nanti dipakai guru)
import connectDB from "@/lib/mongodb";
import Nilai from "@/models/Nilai";

export async function GET(request) {
  try {
    await connectDB();
    const siswa = new URL(request.url).searchParams.get("siswa");
    const data = await Nilai.find(siswa ? { siswa } : {}).sort({ createdAt: -1 });
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const baru = await Nilai.create(await request.json());
    return Response.json({ success: true, data: baru }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}