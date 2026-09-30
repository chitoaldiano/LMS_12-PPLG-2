// POST /api/tugas/ID/kumpul  body: { siswaId, fileUrl, namaFile?, tipe? }
import connectDB from "@/lib/mongodb";
import Tugas from "@/models/Tugas";

export async function POST(request, { params }) {
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
    const ada = tugas.submissions.find((s) => String(s.siswa) === siswaId);
    if (ada) {
      ada.fileUrl = data.fileUrl;
      ada.namaFile = data.namaFile;
      ada.tipe = data.tipe;
      ada.waktuKumpul = new Date();
    } else {
      tugas.submissions.push({ siswa: siswaId, ...data });
    }
    await tugas.save();
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}