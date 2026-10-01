// app/api/tugas/[id]/kumpul/route.ts
// POST /api/tugas/ID/kumpul  body: { siswaId, fileUrl, namaFile?, tipe? }
import connectDB from "@/lib/mongodb";
import Tugas from "@/models/Tugas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const { siswaId, fileUrl, namaFile, tipe } = await request.json();
    if (!siswaId || !fileUrl) {
      return Response.json({ success: false, message: "Link atau file tugas wajib diisi" }, { status: 400 });
    }
    const tugas = await Tugas.findById(id);
    if (!tugas) {
      return Response.json({ success: false, message: "Tugas tidak ditemukan" }, { status: 404 });
    }
    const data = {
      fileUrl,
      namaFile: namaFile || null,
      tipe: tipe === "pdf" ? "pdf" : "link",
    };
    const ada = tugas.submissions.find((s: any) => String(s.siswa) === siswaId);
    if (ada) {
      ada.fileUrl = data.fileUrl;
      ada.namaFile = data.namaFile;
      ada.tipe = data.tipe as "link" | "pdf";
      ada.waktuKumpul = new Date();
    } else {
      tugas.submissions.push({ siswa: siswaId, ...data } as any);
    }
    await tugas.save();
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}