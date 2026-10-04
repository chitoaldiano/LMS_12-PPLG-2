// app/api/kuis/[id]/hasil/route.ts
// GET /api/kuis/ID/hasil -> detail lengkap + daftar siswa yang udah ngerjain (buat guru)

import connectDB from "@/lib/mongodb";
import Kuis from "@/models/Kuis";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    const kuis: any = await Kuis.findById(id)
      .populate("guru", "nama")
      .populate("attempts.siswa", "nama kelas")
      .lean();

    if (!kuis) {
      return Response.json({ success: false, message: "Kuis tidak ditemukan" }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        _id: kuis._id,
        judul: kuis.judul,
        mataPelajaran: kuis.mataPelajaran,
        kelas: kuis.kelas,
        jumlahSoal: kuis.soal.length,
        attempts: kuis.attempts || [],
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}