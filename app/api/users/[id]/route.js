// app/api/users/[id]/route.js
// Akses: DELETE /api/users/ID_USER  -> hapus user
//        PUT    /api/users/ID_USER  -> edit user

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function DELETE(request, { params }) {
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
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const dataUpdate = { ...body };

    // Kalau ada password baru dikirim, hash dulu. Kalau kosong, jangan diubah.
    if (dataUpdate.password) {
      const salt = await bcrypt.genSalt(10);
      dataUpdate.password = await bcrypt.hash(dataUpdate.password, salt);
    } else {
      delete dataUpdate.password;
    }

    const userUpdate = await User.findByIdAndUpdate(id, dataUpdate, {
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
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}