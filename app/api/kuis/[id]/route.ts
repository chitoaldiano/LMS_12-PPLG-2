// app/api/kuis/[id]/route.ts
// GET    /api/kuis/ID?siswa=ID -> detail soal (jawabanBenar disembunyikan kalau siswa belum pernah mengerjakan)
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

    const soal = kuis.soal.map((s: any, i: number) => ({
      pertanyaan: s.pertanyaan,
      pilihan: s.pilihan,
      jawabanBenar: attempt ? s.jawabanBenar : undefined,
      jawabanSaya: attempt ? attempt.jawaban[i] : undefined,
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
        sudahDikerjakan: !!attempt,
        skor: attempt?.skor ?? null,
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