// app/api/users/route.js
// Ambil daftar semua user, bisa difilter per role
// Akses: GET /api/users
//        GET /api/users?role=guru
//        GET /api/users?role=siswa&kelas=X PPLG 1

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const kelas = searchParams.get("kelas");

    const filter = {};
    if (role) filter.role = role;
    if (kelas) filter.kelas = kelas;

    // -password artinya: ambil semua field KECUALI password
    const daftarUser = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return Response.json({ success: true, data: daftarUser });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}