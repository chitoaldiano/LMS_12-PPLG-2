// app/api/tugas/[id]/nilai/route.ts
// PATCH /api/tugas/ID/nilai  body: { siswaId, nilai } -> guru kasih nilai ke 1 submission

import connectDB from "@/lib/mongodb";
import Tugas from "@/models/Tugas";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const { siswaId, nilai } = await request.json();

    if (!siswaId || nilai == null) {
      return Response.json({ success: false, message: "siswaId dan nilai wajib diisi" }, { status: 400 });
    }

    const tugas = await Tugas.findById(id);
    if (!tugas) {
      return Response.json({ success: false, message: "Tugas tidak ditemukan" }, { status: 404 });
    }

    const submisi = tugas.submissions.find((s: any) => String(s.siswa) === siswaId);
    if (!submisi) {
      return Response.json({ success: false, message: "Siswa ini belum mengumpulkan tugas" }, { status: 404 });
    }

    submisi.nilai = nilai;
    await tugas.save();

    return Response.json({ success: true, message: "Nilai berhasil disimpan" });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}