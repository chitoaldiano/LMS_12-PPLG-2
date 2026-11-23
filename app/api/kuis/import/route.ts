// app/api/kuis/import/route.ts
// POST /api/kuis/import -> Membaca dan mem-parsing file .docx / .txt untuk pratinjau soal kuis
// HANYA MEMBACA, TIDAK menyimpan ke database.

import { NextResponse } from "next/server";
import { parseKuisFile } from "@/lib/importKuis";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File kuis (.docx / .txt) wajib diunggah" },
        { status: 400 }
      );
    }

    // Batasi ukuran file maksimal 2MB
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Ukuran file melebihi batas maksimal 2MB" },
        { status: 400 }
      );
    }

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (ext !== ".docx" && ext !== ".txt") {
      return NextResponse.json(
        { success: false, message: "Format file tidak didukung. Harap unggah file .docx atau .txt" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const hasil = await parseKuisFile(buffer, file.name);

    return NextResponse.json({
      success: true,
      data: hasil,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses file import kuis" },
      { status: 500 }
    );
  }
}
