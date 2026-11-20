// lib/mongodb.ts
// Koneksi MongoDB pakai Mongoose, khusus untuk Next.js App Router.
//
// KENAPA HARUS PAKAI POLA SEPERTI INI?
// Next.js (dev mode) sering reload module setiap ada request/hot-reload.
// Kalau kita connect ke MongoDB biasa (tanpa "cache"), tiap reload bikin
// koneksi baru terus menerus sampai MongoDB error "too many connections".
// Makanya koneksi disimpan di variabel global supaya dipakai ulang.

import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

// Simpan koneksi di variabel global (khusus development, App Router sering reload)
let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Tolong isi MONGODB_URI di environment variables (lokal di .env.local atau di Vercel Settings)."
    );
  }

  // Kalau sudah pernah connect, pakai koneksi yang sama (jangan connect lagi)
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false, // biar error langsung ketauan, bukan nunggu timeout
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB berhasil terkoneksi");
      return mongooseInstance;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null; // reset supaya bisa coba connect lagi kalau gagal
    throw e;
  }

  return cached!.conn;
}

export default connectDB;