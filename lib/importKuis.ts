import mammoth from "mammoth";

export interface SoalParsed {
  pertanyaan: string;
  pilihan: string[];
  jawabanBenar: number; // 0-based index
  poinBenar: number;
  poinSalah: number;
}

export interface ParseResult {
  soal: SoalParsed[];
  error: string[];
  peringatan: string[];
  totalPoin: number;
}

interface RawQuestion {
  pertanyaanParts: string[];
  pilihanList: { parts: string[] }[];
  rawPT?: string;
  rawPF?: string;
  kunciList: { raw: string; lineNum: number }[];
  startLine: number;
}

/**
 * Mem-parsing string teks kuis dengan format berbasis tag:
 * Q<nomor>>: Pertanyaan
 * A>: Opsi jawaban
 * PT>: Poin benar (default 1)
 * PF>: Poin salah (default 0)
 * K>: Kunci jawaban satu huruf (A, B, C, dst)
 */
export function parseKuisText(text: string): ParseResult {
  const error: string[] = [];
  const peringatan: string[] = [];

  // Hapus UTF-8 BOM jika ada
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const lines = text.split(/\r?\n/);
  const rawQuestions: RawQuestion[] = [];
  let currentQ: RawQuestion | null = null;
  let lastTarget: "Q" | "A" | "PT" | "PF" | "K" | null = null;

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const lineNum = idx + 1;

    // Cek apakah baris diawali dengan tag yang valid: contoh Q1>:, Q>:, A>:, PT>:, PF>:, K>:
    const tagMatch = rawLine.match(/^\s*([A-Za-z0-9]+)\s*>:\s*(.*)$/);

    if (tagMatch) {
      const tag = tagMatch[1].trim().toUpperCase();
      const content = tagMatch[2].trim();

      // Tag Pertanyaan: Q atau Q diikuti angka (misal Q1, Q2, Q)
      if (/^Q\d*$/i.test(tag)) {
        if (currentQ) {
          rawQuestions.push(currentQ);
        }
        currentQ = {
          pertanyaanParts: content ? [content] : [],
          pilihanList: [],
          kunciList: [],
          startLine: lineNum,
        };
        lastTarget = "Q";
      }
      // Tag Pilihan Jawaban: A
      else if (tag === "A") {
        if (!currentQ) {
          peringatan.push(`Baris ${lineNum}: Opsi jawaban "A>:" ditemukan sebelum ada pertanyaan dan diabaikan.`);
          lastTarget = null;
        } else {
          currentQ.pilihanList.push({ parts: content ? [content] : [] });
          lastTarget = "A";
        }
      }
      // Tag Poin Benar: PT
      else if (tag === "PT") {
        if (!currentQ) {
          peringatan.push(`Baris ${lineNum}: Tag "PT>:" ditemukan di luar pertanyaan dan diabaikan.`);
          lastTarget = null;
        } else {
          currentQ.rawPT = content;
          lastTarget = "PT";
        }
      }
      // Tag Poin Salah: PF
      else if (tag === "PF") {
        if (!currentQ) {
          peringatan.push(`Baris ${lineNum}: Tag "PF>:" ditemukan di luar pertanyaan dan diabaikan.`);
          lastTarget = null;
        } else {
          currentQ.rawPF = content;
          lastTarget = "PF";
        }
      }
      // Tag Kunci Jawaban: K
      else if (tag === "K") {
        if (!currentQ) {
          peringatan.push(`Baris ${lineNum}: Tag "K>:" ditemukan di luar pertanyaan dan diabaikan.`);
          lastTarget = null;
        } else {
          currentQ.kunciList.push({ raw: content, lineNum });
          lastTarget = "K";
        }
      }
      // Tag lain yang tidak dikenal
      else {
        peringatan.push(`Baris ${lineNum}: Tag "${tagMatch[1]}>:" tidak dikenal dan diabaikan.`);
        lastTarget = null;
      }
    } else {
      // Baris tanpa tag
      const trimmed = rawLine.trim();
      if (trimmed === "") {
        // Baris kosong diabaikan
        continue;
      }

      // Baris tanpa tag dianggap lanjutan baris sebelumnya (pertanyaan atau pilihan yang panjang)
      if (lastTarget === "Q" && currentQ) {
        currentQ.pertanyaanParts.push(trimmed);
      } else if (lastTarget === "A" && currentQ && currentQ.pilihanList.length > 0) {
        currentQ.pilihanList[currentQ.pilihanList.length - 1].parts.push(trimmed);
      } else {
        peringatan.push(`Baris ${lineNum}: Teks tanpa tag diabaikan: "${trimmed.slice(0, 50)}${trimmed.length > 50 ? "..." : ""}"`);
      }
    }
  }

  // Simpan soal terakhir
  if (currentQ) {
    rawQuestions.push(currentQ);
  }

  // Validasi jumlah keseluruhan soal
  if (rawQuestions.length === 0) {
    error.push("Tidak ada satu soal pun terbaca dari file.");
    return { soal: [], error, peringatan, totalPoin: 0 };
  }

  if (rawQuestions.length > 200) {
    error.push(`Jumlah soal melebihi batas maksimal 200 soal (terbaca ${rawQuestions.length} soal).`);
  }

  const soal: SoalParsed[] = [];

  // Validasi per soal
  for (let i = 0; i < rawQuestions.length; i++) {
    const q = rawQuestions[i];
    const urutan = i + 1; // Selalu sebut urutan soal

    // 1. Validasi Pertanyaan
    const pertanyaan = q.pertanyaanParts.join(" ").trim();
    if (!pertanyaan) {
      error.push(`Soal ${urutan}: Pertanyaan kosong.`);
    }

    // 2. Validasi Pilihan
    const pilihan: string[] = [];
    let adaPilihanKosong = false;

    for (let pIdx = 0; pIdx < q.pilihanList.length; pIdx++) {
      const pTeks = q.pilihanList[pIdx].parts.join(" ").trim();
      if (!pTeks) {
        adaPilihanKosong = true;
      }
      pilihan.push(pTeks);
    }

    if (adaPilihanKosong) {
      error.push(`Soal ${urutan}: Ada pilihan jawaban yang kosong.`);
    }

    if (pilihan.length < 2 || pilihan.length > 8) {
      error.push(
        `Soal ${urutan}: Jumlah pilihan jawaban harus antara 2 dan 8 (ditemukan ${pilihan.length} pilihan).`
      );
    }

    // 3. Validasi Kunci Jawaban
    let jawabanBenar = 0;
    if (q.kunciList.length > 1) {
      error.push(
        `Soal ${urutan}: Kunci jawaban ganda terdeteksi (${q.kunciList.length} tag K ditemukan). Kunci ganda belum didukung.`
      );
    } else if (q.kunciList.length === 0 || !q.kunciList[0].raw) {
      error.push(`Soal ${urutan}: Kunci jawaban kosong.`);
    } else {
      const rawK = q.kunciList[0].raw.trim();
      // Periksa apakah ada multi huruf seperti "AB" atau "A, B"
      if (/^[A-Za-z][,\s]+[A-Za-z]/i.test(rawK) || /^[A-Za-z]{2,}$/i.test(rawK)) {
        error.push(`Soal ${urutan}: Kunci jawaban ganda ("${rawK}") belum didukung.`);
      } else if (!/^[A-Za-z]$/.test(rawK)) {
        error.push(`Soal ${urutan}: Kunci jawaban "${rawK}" tidak valid (harus berupa satu huruf alfabet A-Z).`);
      } else {
        const hurufKunci = rawK.toUpperCase();
        const indexKunci = hurufKunci.charCodeAt(0) - 65; // 'A' -> 0, 'B' -> 1, dst
        if (indexKunci < 0 || indexKunci >= pilihan.length) {
          const maxHuruf = pilihan.length > 0 ? String.fromCharCode(64 + pilihan.length) : "-";
          error.push(
            `Soal ${urutan}: Kunci jawaban "${hurufKunci}" di luar jumlah pilihan (pilihan hanya sampai ${maxHuruf}).`
          );
        } else {
          jawabanBenar = indexKunci;
        }
      }
    }

    // 4. Validasi PT (Poin Benar)
    let poinBenar = 1;
    if (q.rawPT === undefined || q.rawPT.trim() === "") {
      peringatan.push(`Soal ${urutan}: PT (poin benar) kosong, menggunakan nilai bawaan 1.`);
    } else {
      const parsedPT = Number(q.rawPT.trim());
      if (isNaN(parsedPT)) {
        error.push(`Soal ${urutan}: Nilai PT ("${q.rawPT}") bukan angka.`);
      } else {
        poinBenar = parsedPT;
      }
    }

    // 5. Validasi PF (Poin Salah)
    let poinSalah = 0;
    if (q.rawPF === undefined || q.rawPF.trim() === "") {
      peringatan.push(`Soal ${urutan}: PF (poin salah) kosong, menggunakan nilai bawaan 0.`);
    } else {
      const parsedPF = Number(q.rawPF.trim());
      if (isNaN(parsedPF)) {
        error.push(`Soal ${urutan}: Nilai PF ("${q.rawPF}") bukan angka.`);
      } else {
        poinSalah = parsedPF;
      }
    }

    soal.push({
      pertanyaan,
      pilihan,
      jawabanBenar,
      poinBenar,
      poinSalah,
    });
  }

  const totalPoin = soal.reduce((acc, s) => acc + (s.poinBenar || 0), 0);

  return {
    soal,
    error,
    peringatan,
    totalPoin,
  };
}

/**
 * Membaca buffer file (.docx atau .txt) dan mem-parsing soal kuis
 */
export async function parseKuisFile(buffer: Buffer, fileName: string): Promise<ParseResult> {
  // Batas ukuran maksimal 2MB
  const MAX_SIZE = 2 * 1024 * 1024;
  if (buffer.length > MAX_SIZE) {
    return {
      soal: [],
      error: ["Ukuran file melebihi batas maksimal 2MB."],
      peringatan: [],
      totalPoin: 0,
    };
  }

  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
  if (ext !== ".docx" && ext !== ".txt") {
    return {
      soal: [],
      error: ["Format file tidak didukung. Hanya file berekstensi .docx dan .txt yang diperbolehkan."],
      peringatan: [],
      totalPoin: 0,
    };
  }

  let text = "";
  if (ext === ".txt") {
    text = buffer.toString("utf-8");
  } else if (ext === ".docx") {
    try {
      const res = await mammoth.extractRawText({ buffer });
      text = res.value;
    } catch (err: any) {
      return {
        soal: [],
        error: ["Gagal membaca dokumen Word (.docx): " + (err.message || String(err))],
        peringatan: [],
        totalPoin: 0,
      };
    }
  }

  return parseKuisText(text);
}
