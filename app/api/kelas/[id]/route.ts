// app/api/kelas/[id]/route.ts
// Akses: DELETE /api/kelas/ID_KELAS -> hapus kelas
//        PUT    /api/kelas/ID_KELAS -> edit kelas

import connectDB from "@/lib/mongodb";
import Kelas from "@/models/Kelas";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    const dihapus = await Kelas.findByIdAndDelete(id);

    if (!dihapus) {
      return Response.json(
        { success: false, message: "Kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, message: "Kelas berhasil dihapus" });
  } catch (error: any) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const kelasUpdate = await Kelas.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!kelasUpdate) {
      return Response.json(
        { success: false, message: "Kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: kelasUpdate });
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      return Response.json(
        { success: false, message: "Nama kelas sudah dipakai kelas lain" },
        { status: 409 }
      );
    }
    return Response.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}