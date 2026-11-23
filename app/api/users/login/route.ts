// app/api/users/login/route.ts
// Buat login user yang udah terdaftar
// Akses: POST /api/users/login
//
// PENTING: Mendukung pencocokan multi-identitas dan validasi kesesuaian format peran (role)
// agar akun hanya dapat login sesuai dengan format peran yang dipilih di halaman login.

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  guru: "Guru",
  kurikulum: "Kurikulum",
  kepsek: "Kepsek",
  siswa: "Siswa",
};

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { identifier, password, role } = body;

    if (!identifier || !password) {
      return Response.json(
        { success: false, message: "Identitas akun dan password wajib diisi" },
        { status: 400 }
      );
    }

    const idTrim = String(identifier).trim();
    const idLower = idTrim.toLowerCase();
    const roleExpected = typeof role === "string" ? role.trim().toLowerCase() : undefined;

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
        { success: false, message: "Identitas akun atau password salah" },
        { status: 401 }
      );
    }

    // Bandingkan password yang diketik dengan hash yang tersimpan
    const passwordCocok = await bcrypt.compare(password, user.password);
    if (!passwordCocok) {
      return Response.json(
        { success: false, message: "Identitas akun atau password salah" },
        { status: 401 }
      );
    }

    // Validasi apakah format peran yang dipilih sesuai dengan peran akun sebenarnya
    if (roleExpected && user.role !== roleExpected) {
      const userRoleLabel = ROLE_LABELS[user.role] || user.role;
      const expectedRoleLabel = ROLE_LABELS[roleExpected] || roleExpected;
      return Response.json(
        {
          success: false,
          message: `Format peran tidak sesuai. Akun ini terdaftar sebagai ${userRoleLabel}, bukan ${expectedRoleLabel}. Silakan pilih format peran "${userRoleLabel}" untuk masuk.`,
          suggestedRole: user.role,
        },
        { status: 403 }
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