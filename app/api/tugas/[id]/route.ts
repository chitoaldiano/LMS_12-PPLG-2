// app/api/tugas/[id]/route.ts
// GET    /api/tugas/ID -> detail tugas + daftar submission (dengan nama siswa), buat guru review
// DELETE /api/tugas/ID -> hapus tugas

import connectDB from "@/lib/mongodb";
import Tugas from "@/models/Tugas";
import User from "@/models/User";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const tugas: any = await Tugas.findById(id)
      .populate("guru", "nama")
      .populate("submissions.siswa", "nama kelas")
      .lean();
    if (!tugas) {
      return Response.json({ success: false, message: "Tugas tidak ditemukan" }, { status: 404 });
    }
    return Response.json({ success: true, data: tugas });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const dihapus = await Tugas.findByIdAndDelete(id);
    if (!dihapus) {
      return Response.json({ success: false, message: "Tugas tidak ditemukan" }, { status: 404 });
    }
    return Response.json({ success: true, message: "Tugas berhasil dihapus" });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}