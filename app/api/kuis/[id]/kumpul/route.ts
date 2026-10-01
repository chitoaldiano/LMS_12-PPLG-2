// app/api/kuis/[id]/kumpul/route.ts
// POST /api/kuis/ID/kumpul  body: { siswaId, jawaban: [index,...] }
// Dinilai otomatis di server (bukan di client) supaya jawaban benar tidak bocor sebelum dikumpulkan
import connectDB from "@/lib/mongodb";
import Kuis from "@/models/Kuis";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const { siswaId, jawaban } = await request.json();

    if (!siswaId || !Array.isArray(jawaban)) {
      return Response.json({ success: false, message: "Jawaban tidak valid" }, { status: 400 });
    }

    const kuis = await Kuis.findById(id);
    if (!kuis) {
      return Response.json({ success: false, message: "Kuis tidak ditemukan" }, { status: 404 });
    }
    if (kuis.attempts.find((a: any) => String(a.siswa) === siswaId)) {
      return Response.json({ success: false, message: "Kuis ini sudah pernah kamu kerjakan" }, { status: 400 });
    }

    let benar = 0;
    kuis.soal.forEach((s: any, i: number) => {
      if (jawaban[i] === s.jawabanBenar) benar++;
    });
    const total = kuis.soal.length;
    const skor = total ? Math.round((benar / total) * 100) : 0;

    kuis.attempts.push({ siswa: siswaId, jawaban, skor, waktuSelesai: new Date() } as any);
    await kuis.save();

    const pembahasan = kuis.soal.map((s: any) => s.jawabanBenar);

    return Response.json({ success: true, data: { skor, benar, total, pembahasan } });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}