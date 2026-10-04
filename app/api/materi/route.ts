// app/api/materi/route.ts
// GET  /api/materi?kelas=X&guru=ID  -> daftar materi (filter opsional)
// POST /api/materi                   -> tambah materi baru

import connectDB from "@/lib/mongodb";
import Materi from "@/models/Materi";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const kelas = searchParams.get("kelas");
    const guru = searchParams.get("guru");

    const filter: any = {};
    if (kelas) filter.kelas = kelas;
    if (guru) filter.guru = guru;

    const semuaMateri = await Materi.find(filter)
      .populate("guru", "nama")
      .sort({ createdAt: -1 });

    return Response.json({ success: true, data: semuaMateri });
  } catch (error: any) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const materiBaru = await Materi.create(body);
    return Response.json(
      { success: true, data: materiBaru },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}