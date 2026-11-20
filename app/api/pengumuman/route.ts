// app/api/pengumuman/route.ts
// Akses: GET  /api/pengumuman                -> semua pengumuman
//        GET  /api/pengumuman?target=siswa   -> pengumuman untuk siswa (termasuk yang untuk "semua")
//        POST /api/pengumuman                -> buat pengumuman baru

import connectDB from "@/lib/mongodb";
import Pengumuman from "@/models/Pengumuman";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target");

    const targets: ("semua" | "guru" | "siswa")[] =
      target === "guru" || target === "siswa"
        ? ["semua", target]
        : ["semua"];

    const filter = target
      ? { target: { $in: targets } }
      : {};

    const daftar = await Pengumuman.find(filter).sort({ createdAt: -1 });

    return Response.json({ success: true, data: daftar });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    console.error(error);
    return Response.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada input";
    console.error(error);
    return Response.json(
      { success: false, message },
      { status: 400 }
    );
  }
}
