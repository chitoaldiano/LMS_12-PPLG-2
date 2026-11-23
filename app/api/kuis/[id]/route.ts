// app/api/kuis/[id]/route.ts
// GET    /api/kuis/ID?siswa=ID -> detail kuis & soal untuk siswa
// RAHASIA: Jawaban benar, skor, poin, dan pembahasan tidak pernah dibocorkan ke browser siswa.
// DELETE /api/kuis/ID -> hapus kuis
import connectDB from "@/lib/mongodb";
import Kuis from "@/models/Kuis";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const siswa = new URL(request.url).searchParams.get("siswa");

    const kuis: any = await Kuis.findById(id).populate("guru", "nama").lean();
    if (!kuis) {
      return Response.json({ success: false, message: "Kuis tidak ditemukan" }, { status: 404 });
    }

    const attempt = siswa ? kuis.attempts?.find((a: any) => String(a.siswa) === siswa) : null;

    // Jika siswa sudah pernah mengerjakan: kuis tidak bisa dibuka lagi, jangan bocorkan nilai/soal/kunci
    if (attempt) {
      return Response.json({
        success: true,
        data: {
          _id: kuis._id,
          judul: kuis.judul,
          deskripsi: kuis.deskripsi,
          mataPelajaran: kuis.mataPelajaran,
          durasiMenit: kuis.durasiMenit,
          guru: kuis.guru,
          sudahDikerjakan: true,
        },
      });
    }

    // Siswa belum mengerjakan: berikan daftar pertanyaan & pilihan SAJA
    // Buang seluruh field jawabanBenar, poinBenar, poinSalah
    const soal = (kuis.soal || []).map((s: any) => ({
      pertanyaan: s.pertanyaan,
      pilihan: s.pilihan,
    }));

    return Response.json({
      success: true,
      data: {
        _id: kuis._id,
        judul: kuis.judul,
        deskripsi: kuis.deskripsi,
        mataPelajaran: kuis.mataPelajaran,
        durasiMenit: kuis.durasiMenit,
        guru: kuis.guru,
        soal,
        sudahDikerjakan: false,
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const dihapus = await Kuis.findByIdAndDelete(id);
    if (!dihapus) {
      return Response.json({ success: false, message: "Kuis tidak ditemukan" }, { status: 404 });
    }
    return Response.json({ success: true, message: "Kuis berhasil dihapus" });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
