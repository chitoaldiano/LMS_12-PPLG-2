// app/api/kuis/[id]/kumpul/route.ts
// POST /api/kuis/ID/kumpul  body: { siswaId, jawaban: [index,...], otomatis?: boolean }
// Penilaian otomatis di server berbasis poin (poinBenar dan poinSalah).
// RAHASIA: Hasil nilai TIDAK dikembalikan ke browser siswa.
// Validasi: Jika dikumpulkan manual (bukan otomatis karena waktu habis), seluruh soal wajib sudah dijawab.
import connectDB from "@/lib/mongodb";
import Kuis from "@/models/Kuis";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const { siswaId, jawaban, otomatis } = await request.json();

    if (!siswaId || !Array.isArray(jawaban)) {
      return Response.json({ success: false, message: "Jawaban tidak valid" }, { status: 400 });
    }

    const kuis = await Kuis.findById(id);
    if (!kuis) {
      return Response.json({ success: false, message: "Kuis tidak ditemukan" }, { status: 404 });
    }

    if (kuis.attempts.some((a: any) => String(a.siswa) === siswaId)) {
      return Response.json({ success: false, message: "Kuis ini sudah pernah kamu kerjakan" }, { status: 400 });
    }

    // Jika pengumpulan manual (bukan habis waktu otomatis), pastikan semua soal sudah selesai dikerjakan
    if (!otomatis) {
      const jumlahKosong = kuis.soal.reduce((acc: number, _: any, i: number) => {
        const j = jawaban[i];
        return j === -1 || j === null || j === undefined ? acc + 1 : acc;
      }, 0);

      if (jumlahKosong > 0) {
        return Response.json(
          {
            success: false,
            message: `Jawaban belum siap dikumpulkan karena kuis belum selesai dikerjakan. Masih ada ${jumlahKosong} soal yang belum dijawab.`,
          },
          { status: 400 }
        );
      }
    }

    let benar = 0;
    let salah = 0;
    let kosong = 0;
    let poin = 0;
    let poinMaks = 0;

    kuis.soal.forEach((s: any, i: number) => {
      // Kuis lama tanpa field poin dianggap poinBenar = 1 dan poinSalah = 0
      const pBenar = typeof s.poinBenar === "number" ? s.poinBenar : 1;
      const pSalah = typeof s.poinSalah === "number" ? s.poinSalah : 0;
      poinMaks += pBenar;

      const j = jawaban[i];
      if (j === -1 || j === null || j === undefined) {
        kosong++;
        // Soal tidak dijawab = 0 poin
      } else if (j === s.jawabanBenar) {
        benar++;
        poin += pBenar;
      } else {
        salah++;
        poin += pSalah;
      }
    });

    const skor = poinMaks > 0 ? Math.min(100, Math.max(0, Math.round((poin / poinMaks) * 100))) : 0;

    kuis.attempts.push({
      siswa: siswaId,
      jawaban,
      skor,
      poin,
      poinMaks,
      benar,
      salah,
      kosong,
      waktuSelesai: new Date(),
    } as any);

    await kuis.save();

    // RAHASIA: Jangan pernah kirim skor, poin, benar, atau pembahasan ke browser siswa!
    return Response.json({
      success: true,
      message: "Jawabanmu sudah terkirim. Nilai akan diberikan oleh gurumu.",
    });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
