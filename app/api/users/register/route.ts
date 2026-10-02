// app/api/users/register/route.ts
// Buat daftar user baru (siswa, guru, admin, kepsek, kurikulum)
// Akses: POST /api/users/register
//
// PENTING: login per role beda-beda sekarang:
//   admin     -> username
//   siswa     -> nisn
//   kepsek    -> nip
//   guru      -> email
//   kurikulum -> email

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const LABEL_LOGIN: Record<string, string> = {
  admin: "Username",
  siswa: "NISN",
  kepsek: "NIP",
  guru: "Email",
  kurikulum: "Email",
};

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      nama,
      username,
      email,
      nisn,
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

    if (!nama || !password || !role) {
      return Response.json(
        { success: false, message: "Nama, password, dan role wajib diisi" },
        { status: 400 }
      );
    }

    // Tentukan field login mana yang wajib dicek, sesuai role
    let dupField = "";
    let dupValue = "";
    if (role === "admin") {
      dupField = "username";
      dupValue = (username || "").toLowerCase();
    } else if (role === "siswa") {
      dupField = "nisn";
      dupValue = nisn || "";
    } else if (role === "kepsek") {
      dupField = "nip";
      dupValue = nip || "";
    } else if (role === "guru" || role === "kurikulum") {
      dupField = "email";
      dupValue = (email || "").toLowerCase();
    }

    if (!dupValue) {
      return Response.json(
        { success: false, message: `${LABEL_LOGIN[role] || "Login"} wajib diisi untuk role ini` },
        { status: 400 }
      );
    }

    const userSudahAda = await User.findOne({ [dupField]: dupValue });
    if (userSudahAda) {
      return Response.json(
        { success: false, message: `${LABEL_LOGIN[role]} sudah dipakai, coba yang lain` },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Cuma masukin field login yang relevan biar nggak nyimpen string kosong
    // (string kosong bisa bentrok sama unique index kalau ada user lain yang juga kosong)
    const dataBaru: any = {
      nama,
      password: passwordHash,
      role,
      kelas,
      jurusan,
      mataPelajaran,
      nis,
      noTelepon,
      jenisKelamin,
      alamat,
      status,
      foto,
    };
    if (username) dataBaru.username = username.toLowerCase();
    if (email) dataBaru.email = email.toLowerCase();
    if (nisn) dataBaru.nisn = nisn;
    if (nip) dataBaru.nip = nip;

    const userBaru = await User.create(dataBaru);

    const userTanpaPassword: any = userBaru.toObject();
    delete userTanpaPassword.password;

    return Response.json(
      { success: true, data: userTanpaPassword },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}