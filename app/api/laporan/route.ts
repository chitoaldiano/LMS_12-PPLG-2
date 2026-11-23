// app/api/laporan/route.ts
// Menyediakan rekap data laporan untuk Kurikulum, Kepala Sekolah, dan Admin:
// - ?jenis=rekap-nilai : data seluruh nilai (manual dan tugas; kuis dirahasiakan sehingga tidak disertakan)
// - ?jenis=guru-kelas  : data kelas, wali kelas, jumlah siswa, dan guru yang mengajar
// - ?jenis=aktivitas-guru : jumlah materi, tugas, kuis, dan nilai yang dibuat tiap guru

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Kelas from "@/models/Kelas";
import Materi from "@/models/Materi";
import Tugas from "@/models/Tugas";
import Kuis from "@/models/Kuis";
import Nilai from "@/models/Nilai";

export async function GET(request: Request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const jenis = url.searchParams.get("jenis");

    // =========================================================================
    // 1. REKAP NILAI (Nilai manual dan nilai tugas; nilai kuis dirahasiakan)
    // =========================================================================
    if (jenis === "rekap-nilai") {
      const hasil: any[] = [];
      const seen = new Set<string>();

      // A. Dari koleksi Nilai (penilaian manual / rekap nilai)
      const dataNilai = await Nilai.find({})
        .populate("siswa", "nama kelas jurusan")
        .populate("guru", "nama")
        .lean();

      for (const n of dataNilai as any[]) {
        const siswaObj = n.siswa || {};
        const guruObj = n.guru || {};
        const idStr = String(n._id);
        seen.add(idStr);
        hasil.push({
          id: idStr,
          siswa: siswaObj.nama || "Siswa",
          kelas: n.kelas || siswaObj.kelas || "-",
          jurusan: n.jurusan || siswaObj.jurusan || "-",
          mataPelajaran: n.mataPelajaran || "-",
          guru: guruObj.nama || "Guru",
          guruId: String(guruObj._id || n.guru || ""),
          jenis: n.jenis || "penilaian_manual",
          judul: (n as any).judul || "-",
          nilai: n.nilai,
          tanggal: (n as any).createdAt || new Date(),
        });
      }

      // B. Dari Tugas (pengumpulan tugas yang sudah diberi nilai)
      const dataTugas = await Tugas.find({ "submissions.nilai": { $ne: null } })
        .populate("guru", "nama")
        .populate("submissions.siswa", "nama kelas jurusan")
        .lean();

      for (const t of dataTugas as any[]) {
        const guruNama = t.guru?.nama || "Guru";
        const guruId = String(t.guru?._id || t.guru || "");
        for (const s of t.submissions || []) {
          if (s.nilai != null) {
            const siswaObj = s.siswa || {};
            const key = `tugas-${t._id}-${siswaObj._id || s.siswa}`;
            if (!seen.has(key)) {
              seen.add(key);
              hasil.push({
                id: key,
                siswa: siswaObj.nama || "Siswa",
                kelas: t.kelas || siswaObj.kelas || "-",
                jurusan: siswaObj.jurusan || "-",
                mataPelajaran: t.mataPelajaran || "-",
                guru: guruNama,
                guruId,
                jenis: "tugas",
                judul: t.judul || "Tugas",
                nilai: s.nilai,
                tanggal: s.waktuKumpul || (t as any).createdAt || new Date(),
              });
            }
          }
        }
      }

      // Catatan Kerahasiaan Nilai Kuis:
      // Sesuai aturan kerahasiaan, skor kuis bersifat privat antara guru pembuat dan kuis terkait,
      // sehingga tidak lagi dimasukkan ke rekap-nilai umum Kurikulum/Kepsek.

      hasil.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      return NextResponse.json({ success: true, data: hasil });
    }

    // =========================================================================
    // 2. GURU PER KELAS
    // =========================================================================
    if (jenis === "guru-kelas") {
      const kelasList = await Kelas.find({}).populate("waliKelas", "nama").lean();

      // Hitung jumlah siswa per kelas
      const siswaList = await User.find({ role: "siswa" }, "kelas").lean();
      const countSiswaPerKelas: Record<string, number> = {};
      for (const s of siswaList) {
        if (s.kelas) {
          countSiswaPerKelas[s.kelas] = (countSiswaPerKelas[s.kelas] || 0) + 1;
        }
      }

      // Kumpulkan guru yang aktif mengajar di tiap kelas
      const [materiList, tugasList, kuisList, nilaiList] = await Promise.all([
        Materi.find({}, "kelas guru mataPelajaran").populate("guru", "nama mataPelajaran").lean(),
        Tugas.find({}, "kelas guru mataPelajaran").populate("guru", "nama mataPelajaran").lean(),
        Kuis.find({}, "kelas guru mataPelajaran").populate("guru", "nama mataPelajaran").lean(),
        Nilai.find({}, "kelas guru mataPelajaran").populate("guru", "nama mataPelajaran").lean(),
      ]);

      const guruPerKelasMap: Record<string, Map<string, { _id: string; nama: string; mataPelajaran: Set<string> }>> = {};

      function catatGuru(kName: string, guruObj: any, mapelName?: string) {
        if (!kName || !guruObj) return;
        if (!guruPerKelasMap[kName]) guruPerKelasMap[kName] = new Map();
        const gid = String(guruObj._id || guruObj);
        if (!guruPerKelasMap[kName].has(gid)) {
          const mapelSet = new Set<string>();
          if (Array.isArray(guruObj.mataPelajaran)) {
            guruObj.mataPelajaran.forEach((m: string) => mapelSet.add(m));
          }
          if (mapelName) mapelSet.add(mapelName);
          guruPerKelasMap[kName].set(gid, {
            _id: gid,
            nama: guruObj.nama || "Guru",
            mataPelajaran: mapelSet,
          });
        } else {
          if (mapelName) {
            guruPerKelasMap[kName].get(gid)!.mataPelajaran.add(mapelName);
          }
        }
      }

      for (const m of materiList as any[]) catatGuru(m.kelas, m.guru, m.mataPelajaran);
      for (const t of tugasList as any[]) catatGuru(t.kelas, t.guru, t.mataPelajaran);
      for (const k of kuisList as any[]) catatGuru(k.kelas, k.guru, k.mataPelajaran);
      for (const n of nilaiList as any[]) catatGuru(n.kelas, n.guru, n.mataPelajaran);

      const hasil = (kelasList as any[]).map((k) => {
        const guruMap = guruPerKelasMap[k.namaKelas] || new Map();
        const guruArr = Array.from(guruMap.values()).map((g) => ({
          _id: g._id,
          nama: g.nama,
          mataPelajaran: Array.from(g.mataPelajaran),
        }));

        const waliKelasNama = k.waliKelas?.nama || (typeof k.waliKelas === "string" ? k.waliKelas : "-");

        return {
          _id: k._id,
          kelas: k.namaKelas,
          tingkat: k.tingkat || "-",
          jurusan: k.jurusan || "-",
          waliKelas: waliKelasNama,
          jumlahSiswa: countSiswaPerKelas[k.namaKelas] || 0,
          guru: guruArr,
        };
      });

      return NextResponse.json({ success: true, data: hasil });
    }

    // =========================================================================
    // 3. AKTIVITAS GURU
    // =========================================================================
    if (jenis === "aktivitas-guru") {
      const guruList = await User.find({ role: "guru" }).lean();

      const [materiCounts, tugasCounts, kuisCounts, nilaiCounts] = await Promise.all([
        Materi.aggregate([{ $group: { _id: "$guru", count: { $sum: 1 } } }]),
        Tugas.aggregate([{ $group: { _id: "$guru", count: { $sum: 1 } } }]),
        Kuis.aggregate([{ $group: { _id: "$guru", count: { $sum: 1 } } }]),
        Nilai.aggregate([{ $group: { _id: "$guru", count: { $sum: 1 } } }]),
      ]);

      const mapMateri = Object.fromEntries(materiCounts.map((c) => [String(c._id), c.count]));
      const mapTugas = Object.fromEntries(tugasCounts.map((c) => [String(c._id), c.count]));
      const mapKuis = Object.fromEntries(kuisCounts.map((c) => [String(c._id), c.count]));
      const mapNilai = Object.fromEntries(nilaiCounts.map((c) => [String(c._id), c.count]));

      const hasil = (guruList as any[]).map((g) => {
        const gid = String(g._id);
        return {
          _id: g._id,
          nama: g.nama,
          email: g.email || "-",
          mataPelajaran: Array.isArray(g.mataPelajaran) ? g.mataPelajaran : [],
          materi: mapMateri[gid] || 0,
          tugas: mapTugas[gid] || 0,
          kuis: mapKuis[gid] || 0,
          nilai: mapNilai[gid] || 0,
        };
      });

      hasil.sort((a, b) => a.nama.localeCompare(b.nama));
      return NextResponse.json({ success: true, data: hasil });
    }

    return NextResponse.json({ success: false, message: "Parameter jenis tidak valid" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
