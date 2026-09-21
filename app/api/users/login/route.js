// app/api/users/login/route.js
// Buat login user yang udah terdaftar
// Akses: POST /api/users/login

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json(
        { success: false, message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Cari user berdasarkan username
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      // Sengaja pesannya digeneralisir (bukan "username tidak ditemukan")
      // supaya orang jahat gak bisa nebak-nebak username mana yang terdaftar
      return Response.json(
        { success: false, message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Bandingkan password yang diketik dengan hash yang tersimpan
    const passwordCocok = await bcrypt.compare(password, user.password);
    if (!passwordCocok) {
      return Response.json(
        { success: false, message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Login berhasil - jangan kirim balik password
    const userTanpaPassword = user.toObject();
    delete userTanpaPassword.password;

    return Response.json(
      { success: true, data: userTanpaPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}