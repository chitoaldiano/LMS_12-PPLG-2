// app/api/pengumuman/[id]/route.ts
// Akses: DELETE /api/pengumuman/ID -> hapus pengumuman

import connectDB from "@/lib/mongodb";
import Pengumuman from "@/models/Pengumuman";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    const dihapus = await Pengumuman.findByIdAndDelete(id);

    if (!dihapus) {
      return Response.json(
        { success: false, message: "Pengumuman tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, message: "Pengumuman berhasil dihapus" });
  } catch (error: any) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}