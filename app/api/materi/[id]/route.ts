// app/api/materi/[id]/route.ts
// DELETE /api/materi/ID -> hapus materi (dipakai guru buat hapus materi sendiri)

import connectDB from "@/lib/mongodb";
import Materi from "@/models/Materi";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const dihapus = await Materi.findByIdAndDelete(id);
    if (!dihapus) {
      return Response.json({ success: false, message: "Materi tidak ditemukan" }, { status: 404 });
    }
    return Response.json({ success: true, message: "Materi berhasil dihapus" });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}