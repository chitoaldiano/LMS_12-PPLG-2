// app/api/mapel/route.ts
// GET  /api/mapel -> daftar semua mata pelajaran
// POST /api/mapel -> tambah mata pelajaran baru

import connectDB from "@/lib/mongodb";
import MataPelajaran from "@/models/MataPelajaran";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET() {
  try {
    await connectDB();
    const daftar = await MataPelajaran.find().sort({ nama: 1 });
    return Response.json({ success: true, data: daftar });
  } catch (error: any) {
    console.error(error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const nama = String(body.nama || "").trim();

    if (!nama) {
      return Response.json({ success: false, message: "Nama mata pelajaran wajib diisi" }, { status: 400 });
    }

    // Cek nama kembar tanpa peduli huruf besar/kecil
    const sudahAda = await MataPelajaran.findOne({ nama: new RegExp(`^${escapeRegex(nama)}$`, "i") });
    if (sudahAda) {
      return Response.json(
        { success: false, message: `Mata pelajaran "${sudahAda.nama}" sudah ada` },
        { status: 409 }
      );
    }

    const baru = await MataPelajaran.create({
      nama,
      kode: body.kode || undefined,
      kelompok: body.kelompok || "Umum",
      jurusan: body.jurusan || undefined,
    });

    return Response.json({ success: true, data: baru }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      return Response.json({ success: false, message: "Mata pelajaran sudah ada" }, { status: 409 });
    }
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}