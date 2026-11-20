// app/api/mapel/[id]/route.ts
// PUT    /api/mapel/ID -> edit kode, kelompok, jurusan (nama tidak bisa diubah)
// DELETE /api/mapel/ID -> hapus dari daftar (data guru/materi/tugas yang sudah memakai nama ini tidak ikut terhapus)

import connectDB from "@/lib/mongodb";
import MataPelajaran from "@/models/MataPelajaran";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Nama sengaja tidak diambil dari body: nama dipakai sebagai penghubung ke data lain
    const dataUpdate: any = {
      kode: body.kode || "",
      kelompok: body.kelompok || "Umum",
      jurusan: body.jurusan || "",
    };

    const hasil = await MataPelajaran.findByIdAndUpdate(id, { $set: dataUpdate }, { new: true, runValidators: true });
    if (!hasil) {
      return Response.json({ success: false, message: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }
    return Response.json({ success: true, data: hasil });
  } catch (error: any) {
    console.error(error);
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const dihapus = await MataPelajaran.findByIdAndDelete(id);
    if (!dihapus) {
      return Response.json({ success: false, message: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }
    return Response.json({ success: true, message: "Mata pelajaran berhasil dihapus" });
  } catch (error: any) {
    console.error(error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}