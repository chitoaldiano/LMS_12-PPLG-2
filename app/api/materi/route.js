// app/api/materi/route.js
// Contoh pemakaian koneksi + model. Bisa diakses lewat:
// GET  /api/materi          -> ambil semua materi
// POST /api/materi          -> tambah materi baru

import connectDB from "@/lib/mongodb";
import Materi from "@/models/Materi";
import User from "@/models/User";

export async function GET(request) {
  try {
    await connectDB(); // WAJIB dipanggil di setiap API route sebelum query

    // Contoh filter pakai query param, misal: /api/materi?kelas=X IPA 1
    const { searchParams } = new URL(request.url);
    const kelas = searchParams.get("kelas");

    const filter = kelas ? { kelas } : {};

    const semuaMateri = await Materi.find(filter)
      .populate("guru", "nama") // ambil juga nama gurunya, bukan cuma ID
      .sort({ createdAt: -1 }); // terbaru duluan

    return Response.json({ success: true, data: semuaMateri });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    // body contoh: { judul, mataPelajaran, kelas, tipe, fileUrl, guru }

    const materiBaru = await Materi.create(body);

    return Response.json(
      { success: true, data: materiBaru },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
