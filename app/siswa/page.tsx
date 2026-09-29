"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PATHS = {
  beranda: "M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z",
  materi: "M5 4h11a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 1-1Z",
  tugas: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
  nilai: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  pengumuman: "M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1ZM16 8.5a5 5 0 0 1 0 7",
  logout: "M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9",
};
const NAV = [
  ["beranda", "Beranda"],
  ["materi", "Materi"],
  ["tugas", "Tugas"],
  ["nilai", "Nilai"],
  ["pengumuman", "Pengumuman"],
];
const fmt = (d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

function Ico({ k, className = "w-[18px] h-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d={PATHS[k]} />
    </svg>
  );
}
function Box({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D5] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E0D5]">
        <h2 className="font-semibold text-[#0F1B33]">{title}</h2>
      </div>
      {children}
    </div>
  );
}
const Kosong = ({ text }) => <p className="px-6 py-10 text-sm text-[#9CA3AF] text-center">{text}</p>;

function Pengumuman({ list }) {
  return list.map((p) => (
    <div key={p._id} className="px-6 py-4 border-b border-[#F0EDE3] last:border-0">
      <div className="flex items-center gap-2 mb-1">
        {p.prioritas === "penting" && (
          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-semibold">Penting</span>
        )}
        <span className="text-xs text-[#9CA3AF]">{fmt(p.createdAt)}</span>
      </div>
      <p className="font-semibold text-[#0F1B33]">{p.judul}</p>
      <p className="text-sm text-[#6B7280] mt-1 whitespace-pre-line">{p.isi}</p>
    </div>
  ));
}

export default function SiswaDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [nav, setNav] = useState("beranda");
  const [loading, setLoading] = useState(true);
  const [materi, setMateri] = useState([]);
  const [tugas, setTugas] = useState([]);
  const [nilai, setNilai] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);
  const [links, setLinks] = useState({});
  const [pesan, setPesan] = useState({});

  useEffect(() => {
    const s = localStorage.getItem("lms_user");
    if (!s) return router.push("/login");
    const u = JSON.parse(s);
    if (u.role !== "siswa") return router.push("/login");
    setUser(u);
    muat(u);
  }, [router]);

  async function muat(u) {
    setLoading(true);
    const j = (url) => fetch(url).then((r) => r.json()).then((r) => (r.success ? r.data : [])).catch(() => []);
    const k = encodeURIComponent(u.kelas || "");
    const [m, t, n, p] = await Promise.all([
      j(`/api/materi?kelas=${k}`),
      j(`/api/tugas?kelas=${k}&siswa=${u._id}`),
      j(`/api/nilai?siswa=${u._id}`),
      j("/api/pengumuman?target=siswa"),
    ]);
    setMateri(m); setTugas(t); setNilai(n); setPengumuman(p);
    setLoading(false);
  }

  async function kumpul(t) {
    const fileUrl = (links[t._id] || "").trim();
    if (!fileUrl) return setPesan({ ...pesan, [t._id]: "Isi link tugas dulu" });
    const r = await fetch(`/api/tugas/${t._id}/kumpul`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siswaId: user._id, fileUrl }),
    }).then((x) => x.json());
    setPesan({ ...pesan, [t._id]: r.success ? "Tugas berhasil dikumpulkan" : r.message });
    if (r.success) {
      setLinks({ ...links, [t._id]: "" });
      muat(user);
    }
  }

  function logout() {
    localStorage.removeItem("lms_user");
    router.push("/login");
  }

  if (!user) return null;

  const belum = tugas.filter((t) => !t.pengumpulan).length;
  const rata = nilai.length ? Math.round(nilai.reduce((a, n) => a + n.nilai, 0) / nilai.length) : "-";
  const stats = [
    ["Materi", materi.length],
    ["Tugas belum dikumpulkan", belum],
    ["Rata-rata nilai", rata],
    ["Pengumuman", pengumuman.length],
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex">
      <aside className="w-64 bg-[#0F1B33] text-white flex flex-col shrink-0">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-[#C6992F] font-bold text-xs border border-[#C6992F]/60 shrink-0">SMK</div>
          <div>
            <p className="font-bold text-sm leading-tight">LMS</p>
            <p className="text-[11px] text-white/60 leading-tight">SMK Citra Negara</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setNav(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                nav === key ? "bg-[#C6992F] text-[#0F1B33]" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Ico k={key} />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-5 border-t border-white/10">
          <div className="px-3 mb-3">
            <p className="text-sm font-medium truncate">{user.nama}</p>
            <p className="text-xs text-white/50">{user.kelas || "Siswa"}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition">
            <Ico k="logout" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 px-8 py-8 max-w-5xl">
        {nav === "beranda" && (
          <>
            <h1 className="text-2xl font-bold text-[#0F1B33]">Halo, {user.nama.split(" ")[0]}!</h1>
            <p className="text-sm text-[#6B7280] mt-1 mb-8">Kelas {user.kelas || "-"} &middot; selamat belajar hari ini</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map(([label, v]) => (
                <div key={label} className="bg-white rounded-2xl border border-[#E5E0D5] shadow-sm px-5 py-5">
                  <p className="text-3xl font-bold text-[#0F1B33]">{v}</p>
                  <p className="text-xs font-medium text-[#6B7280] mt-1">{label}</p>
                </div>
              ))}
            </div>
            <Box title="Pengumuman Terbaru">
              {pengumuman.length === 0 ? <Kosong text="Belum ada pengumuman." /> : <Pengumuman list={pengumuman.slice(0, 3)} />}
            </Box>
          </>
        )}

        {nav === "materi" && (
          <Box title="Materi Pembelajaran">
            {loading ? <Kosong text="Memuat..." /> : materi.length === 0 ? <Kosong text="Belum ada materi untuk kelasmu." /> : materi.map((m) => (
              <div key={m._id} className="px-6 py-4 border-b border-[#F0EDE3] last:border-0 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-[#0F1B33]">{m.judul}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {m.mataPelajaran} &middot; {m.guru?.nama || "Guru"} &middot; {m.tipe === "pdf" ? "PDF" : "Tautan"}
                  </p>
                </div>
                <a href={m.fileUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-xs font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition shrink-0">
                  Buka
                </a>
              </div>
            ))}
          </Box>
        )}

        {nav === "tugas" && (
          <Box title="Tugas">
            {loading ? <Kosong text="Memuat..." /> : tugas.length === 0 ? <Kosong text="Belum ada tugas untuk kelasmu." /> : tugas.map((t) => {
              const telat = !t.pengumpulan && new Date(t.deadline) < new Date();
              const badge = t.pengumpulan
                ? ["Sudah dikumpulkan", "bg-green-50 text-green-700"]
                : telat
                ? ["Lewat deadline", "bg-red-50 text-red-600"]
                : ["Belum dikumpulkan", "bg-amber-50 text-amber-700"];
              return (
                <div key={t._id} className="px-6 py-5 border-b border-[#F0EDE3] last:border-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-[#0F1B33]">{t.judul}</p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        {t.mataPelajaran} &middot; Deadline {fmt(t.deadline)}
                      </p>
                      {t.deskripsi && <p className="text-sm text-[#6B7280] mt-2">{t.deskripsi}</p>}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge[1]}`}>{badge[0]}</span>
                  </div>
                  {t.pengumpulan?.nilai != null && (
                    <p className="text-sm text-[#0F1B33] mt-2">Nilai: <strong>{t.pengumpulan.nilai}</strong></p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <input
                      placeholder="Tempel link tugas (Google Drive, dll)"
                      value={links[t._id] || ""}
                      onChange={(e) => setLinks({ ...links, [t._id]: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]"
                    />
                    <button onClick={() => kumpul(t)} className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition">
                      {t.pengumpulan ? "Kirim ulang" : "Kumpulkan"}
                    </button>
                  </div>
                  {pesan[t._id] && <p className="text-xs text-[#6B7280] mt-2">{pesan[t._id]}</p>}
                </div>
              );
            })}
          </Box>
        )}

        {nav === "nilai" && (
          <Box title="Nilai">
            {loading ? <Kosong text="Memuat..." /> : nilai.length === 0 ? <Kosong text="Belum ada nilai." /> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#9CA3AF] border-b border-[#E5E0D5]">
                    <th className="px-6 py-3 font-medium">Mata Pelajaran</th>
                    <th className="px-6 py-3 font-medium">Jenis</th>
                    <th className="px-6 py-3 font-medium">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {nilai.map((n) => (
                    <tr key={n._id} className="border-b border-[#F0EDE3] last:border-0">
                      <td className="px-6 py-3.5 text-[#1F2430] font-medium">{n.mataPelajaran}</td>
                      <td className="px-6 py-3.5 text-[#6B7280] capitalize">{n.jenis.replace("_", " ")}</td>
                      <td className="px-6 py-3.5 font-semibold text-[#0F1B33]">{n.nilai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Box>
        )}

        {nav === "pengumuman" && (
          <Box title="Pengumuman">
            {pengumuman.length === 0 ? <Kosong text="Belum ada pengumuman." /> : <Pengumuman list={pengumuman} />}
          </Box>
        )}
      </main>
    </div>
  );
}