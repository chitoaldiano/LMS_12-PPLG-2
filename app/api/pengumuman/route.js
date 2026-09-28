// app/api/pengumuman/route.js
// Akses: GET  /api/pengumuman                -> semua pengumuman
//        GET  /api/pengumuman?target=siswa   -> pengumuman untuk siswa (termasuk yang untuk "semua")
//        POST /api/pengumuman                -> buat pengumuman baru

import connectDB from "@/lib/mongodb";
import Pengumuman from "@/models/Pengumuman";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target");

    const filter = target ? { target: { $in: ["semua", target] } } : {};

    const daftar = await Pengumuman.find(filter).sort({ createdAt: -1 });

    return Response.json({ success: true, data: daftar });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { judul, isi, target, prioritas, pembuat } = body;

    if (!judul || !isi) {
      return Response.json(
        { success: false, message: "Judul dan isi pengumuman wajib diisi" },
        { status: 400 }
      );
    }

    const baru = await Pengumuman.create({ judul, isi, target, prioritas, pembuat });

    return Response.json({ success: true, data: baru }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}