// app/api/users/login/route.ts
// Buat login user yang udah terdaftar
// Akses: POST /api/users/login
//
// PENTING: satu kolom login di halaman login, tapi dicocokkan ke 4 kemungkinan field
// sekaligus (sesuai role user tsb): username (admin), nisn (siswa), nip (kepsek), email (guru/kurikulum)

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return Response.json(
        { success: false, message: "Login dan password wajib diisi" },
        { status: 400 }
      );
    }

    const idTrim = String(identifier).trim();
    const idLower = idTrim.toLowerCase();

    // Cari user yang cocok di salah satu dari 4 kemungkinan field login
    const user = await User.findOne({
      $or: [
        { username: idLower },
        { nisn: idTrim },
        { nip: idTrim },
        { email: idLower },
      ],
    });

    if (!user) {
      // Sengaja pesannya digeneralisir (bukan "akun tidak ditemukan")
      // supaya orang jahat gak bisa nebak-nebak akun mana yang terdaftar
      return Response.json(
        { success: false, message: "Login atau password salah" },
        { status: 401 }
      );
    }

    // Bandingkan password yang diketik dengan hash yang tersimpan
    const passwordCocok = await bcrypt.compare(password, user.password);
    if (!passwordCocok) {
      return Response.json(
        { success: false, message: "Login atau password salah" },
        { status: 401 }
      );
    }

    // Login berhasil - jangan kirim balik password
    const userTanpaPassword: any = user.toObject();
    delete userTanpaPassword.password;

    return Response.json(
      { success: true, data: userTanpaPassword },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}