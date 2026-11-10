// app/api/users/[id]/route.ts
// Akses: DELETE /api/users/ID_USER  -> hapus user
//        PUT    /api/users/ID_USER  -> edit user

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    const dihapus = await User.findByIdAndDelete(id);

    if (!dihapus) {
      return Response.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, message: "User berhasil dihapus" });
  } catch (error: any) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const dataUpdate: any = { ...body };
    const hapusField: any = {};

    // Kalau ada password baru dikirim, hash dulu. Kalau kosong, jangan diubah.
    if (dataUpdate.password) {
      const salt = await bcrypt.genSalt(10);
      dataUpdate.password = await bcrypt.hash(dataUpdate.password, salt);
    } else {
      delete dataUpdate.password;
    }

    // Field login yang unik: kalau dikosongkan, HAPUS fieldnya (jangan disimpan string kosong,
    // karena string kosong bisa bentrok dengan user lain yang juga kosong)
    for (const f of ["username", "email", "nisn", "nip"]) {
      if (f in dataUpdate && (dataUpdate[f] === "" || dataUpdate[f] == null)) {
        delete dataUpdate[f];
        hapusField[f] = "";
      }
    }
    if (typeof dataUpdate.username === "string") dataUpdate.username = dataUpdate.username.toLowerCase().trim();
    if (typeof dataUpdate.email === "string") dataUpdate.email = dataUpdate.email.toLowerCase().trim();

    // Role tidak boleh diubah lewat sini
    delete dataUpdate.role;

    const operasi: any = { $set: dataUpdate };
    if (Object.keys(hapusField).length > 0) operasi.$unset = hapusField;

    const userUpdate = await User.findByIdAndUpdate(id, operasi, {
      new: true, // biar hasil yg dibalikin adalah data SETELAH diupdate
      runValidators: true,
    }).select("-password");

    if (!userUpdate) {
      return Response.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: userUpdate });
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "data";
      const label: any = { username: "Username", email: "Email", nisn: "NISN", nip: "NIP" };
      return Response.json(
        { success: false, message: `${label[field] || field} sudah dipakai user lain` },
        { status: 409 }
      );
    }
    return Response.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}