// app/api/users/register/route.js
// Buat daftar user baru (siswa, guru, admin, kepsek, kurikulum)
// Akses: POST /api/users/register

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      nama,
      username,
      email,
      password,
      role,
      kelas,
      jurusan,
      mataPelajaran,
      nis,
      nip,
      noTelepon,
      jenisKelamin,
      alamat,
      status,
      foto,
    } = body;

    if (!nama || !username || !password || !role) {
      return Response.json(
        { success: false, message: "Nama, username, password, dan role wajib diisi" },
        { status: 400 }
      );
    }

    const userSudahAda = await User.findOne({ username: username.toLowerCase() });
    if (userSudahAda) {
      return Response.json(
        { success: false, message: "Username sudah dipakai, coba username lain" },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userBaru = await User.create({
      nama,
      username,
      email,
      password: passwordHash,
      role,
      kelas,
      jurusan,
      mataPelajaran,
      nis,
      nip,
      noTelepon,
      jenisKelamin,
      alamat,
      status,
      foto,
    });

    const userTanpaPassword = userBaru.toObject();
    delete userTanpaPassword.password;

    return Response.json(
      { success: true, data: userTanpaPassword },
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