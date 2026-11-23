// app/api/kuis/[id]/hasil/route.ts
// GET /api/kuis/ID/hasil?guru=ID_GURU
// Hasil kuis bersifat RAHASIA: hanya guru pemilik kuis yang berhak mengaksesnya.

import connectDB from "@/lib/mongodb";
import Kuis from "@/models/Kuis";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const guruId = new URL(request.url).searchParams.get("guru");

    if (!guruId) {
      return Response.json(
        { success: false, message: "Parameter guru wajib disertakan untuk mengakses hasil kuis" },
        { status: 400 }
      );
    }

    const kuis: any = await Kuis.findById(id)
      .populate("guru", "nama")
      .populate("attempts.siswa", "nama kelas")
      .lean();

    if (!kuis) {
      return Response.json({ success: false, message: "Kuis tidak ditemukan" }, { status: 404 });
    }

    // TODO: Ganti pemeriksaan id guru dari query parameter ini dengan verifikasi sesi / JWT di server-side
    // setelah autentikasi terpusat diimplementasikan. Saat ini autentikasi masih mengandalkan client-side state
    // sehingga parameter ini masih dapat dipalsukan bila pengguna mengetahui ID guru pemilik.
    const pemilikId = String(kuis.guru?._id || kuis.guru);
    if (pemilikId !== guruId) {
      return Response.json(
        { success: false, message: "Akses ditolak: Anda bukan guru pemilik kuis ini." },
        { status: 403 }
      );
    }

    const totalPoinMaks = kuis.soal.reduce(
      (acc: number, s: any) => acc + (typeof s.poinBenar === "number" ? s.poinBenar : 1),
      0
    );

    const attempts = (kuis.attempts || []).map((a: any) => ({
      siswa: a.siswa,
      jawaban: a.jawaban,
      skor: a.skor,
      poin: a.poin ?? 0,
      poinMaks: a.poinMaks || totalPoinMaks,
      benar: a.benar ?? 0,
      salah: a.salah ?? 0,
      kosong: a.kosong ?? 0,
      waktuSelesai: a.waktuSelesai,
    }));

    return Response.json({
      success: true,
      data: {
        _id: kuis._id,
        judul: kuis.judul,
        deskripsi: kuis.deskripsi,
        mataPelajaran: kuis.mataPelajaran,
        kelas: kuis.kelas,
        durasiMenit: kuis.durasiMenit,
        jumlahSoal: kuis.soal.length,
        totalPoinMaks,
        attempts,
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
