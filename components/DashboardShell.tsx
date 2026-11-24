"use client";

// Kerangka dashboard yang dipakai Kurikulum & Kepsek:
// cek login + role, sidebar bertema Citra Negara, topbar, dan area konten.
// Isi tiap menu diatur lewat prop `render` dari halaman masing-masing.

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const PATHS: Record<string, string> = {
  beranda: "M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z",
  materi: "M5 4h11a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 1-1Z",
  tugas: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
  kuis: "M9 11l3 3 8-8M4 4h9M4 9h5M4 14h9M4 19h5",
  nilai: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  pengumuman: "M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1ZM16 8.5a5 5 0 0 1 0 7",
  guru: "M9 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M17 11a2.6 2.6 0 1 0 0-5.2M15 15c2.6.2 4.5 2 4.5 4.6",
  siswa: "M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5 20c0-3.6 3-6 7-6s7 2.4 7 6",
  kelas: "M4 21V9l8-5 8 5v12M9 21v-6h6v6M4 11h16",
  profil: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20c0-4 3.6-6 8-6s8 2 8 6",
  logout: "M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9",
  laporan: "M7 3h8l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM9 12h6M9 16h6M9 8h3",
};

export function Ico({ k, className = "w-[18px] h-[18px]" }: { k: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d={PATHS[k] || PATHS.beranda} />
    </svg>
  );
}

export function Box({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0DCE8] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#F0DCE8] flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-extrabold text-[#59234F] text-base">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Kosong({ text }: { text: string }) {
  return <p className="px-6 py-10 text-sm text-[#B596AA] text-center">{text}</p>;
}

export function StatCard({
  label,
  value,
  icon = "beranda",
  onClick,
}: {
  label: string;
  value: ReactNode;
  icon?: string;
  onClick?: () => void;
}) {
  const isClickable = !!onClick;
  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`group flex min-h-[92px] sm:min-h-[116px] items-center justify-between gap-2.5 sm:gap-3 rounded-2xl border border-[#F5D8E7] bg-white px-3 sm:px-4 py-2.5 sm:py-4 shadow-[0_4px_14px_rgba(91,31,75,0.045)] transition-all ${
        isClickable
          ? "cursor-pointer hover:-translate-y-1 hover:border-[#D95A91]/50 hover:shadow-[0_12px_28px_rgba(91,31,75,0.1)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#D94383]"
          : ""
      }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <span
          className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-[#FCE4F0] text-[#B52D78] transition-transform ${
            isClickable ? "group-hover:scale-110 group-hover:bg-[#FAD0E4]" : ""
          }`}
        >
          <Ico k={icon} className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>
        <div className="min-w-0">
          <p className="line-clamp-2 text-[11px] sm:text-xs font-semibold leading-snug text-[#81506F]">{label}</p>
          <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl lg:text-3xl font-extrabold leading-none text-[#59234F]">{value}</p>
          {isClickable && (
            <p className="text-[10px] text-[#B596AA] mt-1 group-hover:text-[#D94383] transition-colors flex items-center gap-1 font-medium">
              Buka {label} &rarr;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Batang horizontal sederhana untuk grafik persentase/nilai
export function Bar({ label, value, extra }: { label: string; value: number; extra?: string }) {
  const lebar = Math.max(0, Math.min(100, value));
  return (
    <div className="mb-3.5 last:mb-0">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-[#59234F] font-semibold truncate pr-3">{label}</span>
        <span className="text-[#81506F] shrink-0 font-medium">
          {value}
          {extra ? ` · ${extra}` : ""}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-[#FCEAF3] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#D94383] to-[#70295F]" style={{ width: `${lebar}%` }} />
      </div>
    </div>
  );
}

export async function ambilData(url: string): Promise<any[]> {
  try {
    const r = await fetch(url).then((x) => x.json());
    return r.success ? r.data : [];
  } catch {
    return [];
  }
}

type Ctx = {
  user: any;
  nav: string;
  setNav: (k: string) => void;
  setUser: (u: any) => void;
};

export default function DashboardShell({
  role,
  subtitle,
  items,
  render,
}: {
  role: string;
  subtitle: string;
  items: [string, string][];
  render: (ctx: Ctx) => ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [nav, setNav] = useState<string>(items[0][0]);
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("lms_user");
    if (!s) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(s);
    if (u.role !== role) {
      router.push("/login");
      return;
    }
    setUser(u);
  }, [router, role]);

  function logout() {
    localStorage.removeItem("lms_user");
    router.push("/login");
  }

  if (!user) return null;

  const roleBadge = role === "kurikulum" ? "Kurikulum" : role === "kepsek" ? "Kepala Sekolah" : role;

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-[#FFF7FB] text-[#59234F]">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar: Drawer on mobile (< md), compact on tablet (md), expanded on desktop (lg) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[260px] flex-col overflow-hidden bg-gradient-to-b from-[#70295F] via-[#5D2452] to-[#42183D] text-white shadow-2xl transition-transform duration-300 md:static md:translate-x-0 md:shadow-[8px_0_28px_rgba(76,25,61,0.08)] md:w-[76px] lg:w-[252px] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 md:justify-center lg:justify-start lg:px-5 lg:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#F3B8D3] bg-white shadow-md lg:h-11 lg:w-11">
              <img src="/logo.png" alt="Logo SMK Citra Negara" className="h-full w-full object-contain p-1" />
            </div>
            <div className="min-w-0 md:hidden lg:block">
              <p className="truncate text-[14px] font-bold leading-tight tracking-tight">SMK Citra Negara</p>
              <p className="mt-1 text-[10px] leading-tight text-white/65">Learning Management System</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
            aria-label="Tutup Menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-4 [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin] md:px-2 lg:px-3 lg:pt-5">
          <p className="mb-2 hidden items-center gap-2 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 lg:flex">
            <span className="h-px flex-1 bg-white/15" />Menu Utama<span className="h-px flex-1 bg-white/15" />
          </p>
          <div className="space-y-1">
            {items.map(([key, label]) => {
              const active = nav === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setNav(key);
                    setSidebarOpen(false);
                  }}
                  title={label}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-[42px] w-full items-center justify-start gap-3 rounded-xl px-3.5 py-2 text-left text-[13px] font-semibold transition-all duration-200 md:justify-center lg:justify-start ${
                    active
                      ? "bg-gradient-to-r from-[#F8D9E8] to-[#E9A6C6] text-[#541A45] shadow-[0_5px_14px_rgba(35,8,28,0.16)]"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Ico
                    k={key}
                    className={`h-[19px] w-[19px] shrink-0 transition-transform ${active ? "scale-105" : "group-hover:scale-105"}`}
                  />
                  <span className="flex-1 truncate md:hidden lg:inline">{label}</span>
                  {active && <span className="hidden h-1.5 w-1.5 shrink-0 rounded-full bg-[#8C326B] lg:block" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 bg-black/[0.04] px-3 pb-3 pt-3 md:px-2 lg:px-3 lg:pb-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2 md:hidden lg:flex">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white ring-1 ring-white/15 overflow-hidden">
              {user.foto ? (
                <img src={user.foto} alt="" className="w-full h-full object-cover" />
              ) : (
                user.nama?.[0]?.toUpperCase() || "U"
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{user.nama}</span>
              <span className="block truncate text-[11px] text-white/60">{roleBadge}</span>
            </span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="flex min-h-[42px] w-full items-center justify-start gap-3 rounded-xl px-3.5 py-2 text-[13px] font-semibold text-white/75 transition hover:bg-white/10 hover:text-white md:justify-center lg:justify-start"
          >
            <Ico k="logout" className="h-[19px] w-[19px] shrink-0" />
            <span className="md:hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <header className="sticky top-0 z-30 flex h-[68px] sm:h-[82px] min-h-[68px] sm:min-h-[82px] w-full shrink-0 items-center justify-between gap-3 border-b border-[#F0DCE8] bg-white/95 px-3 sm:px-6 xl:px-8 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F0DCE8] bg-white text-[#59234F] hover:bg-[#FFF0F6] transition shadow-xs"
              aria-label="Buka Menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Desktop Search Bar */}
            <div className="relative hidden sm:block w-full max-w-[360px] lg:max-w-[420px]">
              <div className="flex items-center gap-2.5 bg-white border border-[#EEDCE7] rounded-full px-3.5 py-2 shadow-[0_3px_15px_rgba(91,31,75,0.04)] focus-within:ring-2 focus-within:ring-[#D94383] focus-within:border-transparent transition">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#6B2858] shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const allNavs = [...items, ["profil", "Profil"] as [string, string]];
                      const match = allNavs.find(([, l]) => l.toLowerCase().includes(searchQuery.toLowerCase().trim()));
                      if (match) {
                        setNav(match[0]);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }
                    } else if (e.key === "Escape") {
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Cari fitur atau menu..."
                  className="w-full bg-transparent text-sm text-[#59234F] placeholder:text-[#A78A9D] outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                    className="text-[#A78A9D] hover:text-[#59234F] text-xs font-bold p-0.5"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Dropdown Quick Nav */}
              {searchOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-2xl border border-[#F0DCE8] shadow-xl z-50 overflow-hidden py-1">
                  <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[#F0DCE8]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#B596AA]">
                      {searchQuery ? "Hasil Pencarian Fitur" : "Pintasan Menu"}
                    </p>
                    <button onClick={() => setSearchOpen(false)} className="text-[10px] text-[#A78A9D] hover:text-[#59234F]">Tutup</button>
                  </div>
                  {[...items, ["profil", "Profil Saya"] as [string, string]]
                    .filter(([, label]) => !searchQuery || label.toLowerCase().includes(searchQuery.toLowerCase().trim()))
                    .map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setNav(key);
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 text-left text-xs font-semibold text-[#59234F] hover:bg-[#FFF0F6] transition"
                      >
                        <span className="p-1.5 rounded-lg bg-[#FCE4F0] text-[#B52D78]">
                          <Ico k={key} className="w-3.5 h-3.5" />
                        </span>
                        <span className="flex-1">{label}</span>
                        <span className="text-[10px] text-[#B596AA]">Buka &rarr;</span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="sm:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F0DCE8] bg-white text-[#59234F] hover:bg-[#FFF0F6] transition shadow-xs"
              aria-label="Cari Fitur"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#6B2858]" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setShowNotif((v) => !v)}
                className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full hover:bg-[#FFF0F6] flex items-center justify-center transition"
                aria-label="Notifikasi"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 sm:w-6 sm:h-6 text-[#59234F]">
                  <path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8ZM10 19a2 2 0 0 0 4 0" />
                </svg>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#D94383] ring-2 ring-white" />
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-2xl border border-[#F0DCE8] shadow-xl z-30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#F0DCE8]">
                    <p className="text-sm font-semibold text-[#59234F]">Notifikasi LMS</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs text-[#81506F]">Semua layanan dan sistem sekolah berjalan normal.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="h-7 sm:h-8 w-px bg-[#F0DCE8]" />

            <button onClick={() => setNav("profil")} className="flex items-center gap-2.5 sm:gap-3 text-left group">
              <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#70295F] text-white text-xs sm:text-sm font-bold flex items-center justify-center overflow-hidden shrink-0 shadow-sm ring-2 ring-transparent group-hover:ring-[#D94383]/30 transition">
                {user.foto ? (
                  <img src={user.foto} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.nama?.[0]?.toUpperCase() || "U"
                )}
              </span>
              <span className="hidden sm:block">
                <span className="block text-sm font-bold text-[#59234F]">{user.nama}</span>
                <span className="block text-xs text-[#B596AA]">{subtitle}</span>
              </span>
            </button>
          </div>
        </header>

        {/* Mobile Search Overlay */}
        {searchOpen && (
          <div className="sm:hidden px-3 py-2.5 bg-white border-b border-[#F0DCE8] shadow-md z-20">
            <div className="flex items-center gap-2 bg-[#FFF7FB] border border-[#EEDCE7] rounded-xl px-3 py-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#6B2858] shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari fitur..."
                className="w-full bg-transparent text-sm text-[#59234F] outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs font-semibold text-[#81506F] hover:text-[#59234F] px-1"
              >
                Tutup
              </button>
            </div>
            <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
              {[...items, ["profil", "Profil Saya"] as [string, string]]
                .filter(([, label]) => !searchQuery || label.toLowerCase().includes(searchQuery.toLowerCase().trim()))
                .map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setNav(key);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-[#59234F] hover:bg-[#FFF0F6] transition"
                  >
                    <span>{label}</span>
                    <span className="text-[10px] text-[#B596AA]">Buka &rarr;</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="w-full min-w-0 flex-1 px-3 py-4 sm:px-6 sm:py-6 xl:px-8 xl:py-6">
          {render({ user, nav, setNav, setUser })}
        </div>
      </main>
    </div>
  );
}
