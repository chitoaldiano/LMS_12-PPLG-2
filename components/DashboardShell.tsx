"use client";

// Kerangka dashboard yang dipakai Kurikulum & Kepsek:
// cek login + role, sidebar, tombol logout, dan area konten.
// Isi tiap menu diatur lewat prop `render` dari halaman masing-masing.

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

const PATHS: Record<string, string> = {
  beranda: "M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z",
  guru: "M9 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M17 11a2.6 2.6 0 1 0 0-5.2M15 15c2.6.2 4.5 2 4.5 4.6",
  kelas: "M4 21V9l8-5 8 5v12M9 21v-6h6v6M4 11h16",
  nilai: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  profil: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20c0-4 3.6-6 8-6s8 2 8 6",
  logout: "M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9",
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
    <div className="bg-white rounded-2xl border border-[#E5E0D5] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E0D5] flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-semibold text-[#0F1B33]">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Kosong({ text }: { text: string }) {
  return <p className="px-6 py-10 text-sm text-[#9CA3AF] text-center">{text}</p>;
}

export function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D5] shadow-sm px-5 py-4">
      <p className="text-2xl font-bold text-[#0F1B33]">{value}</p>
      <p className="text-xs text-[#6B7280] mt-1">{label}</p>
    </div>
  );
}

// Batang horizontal sederhana buat grafik (tanpa library)
export function Bar({ label, value, extra }: { label: string; value: number; extra?: string }) {
  const lebar = Math.max(0, Math.min(100, value));
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[#1F2430] font-medium truncate pr-3">{label}</span>
        <span className="text-[#6B7280] shrink-0">
          {value}
          {extra ? ` · ${extra}` : ""}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-[#F0EDE3] overflow-hidden">
        <div className="h-full rounded-full bg-[#C6992F]" style={{ width: `${lebar}%` }} />
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

  return (
    <div className="flex min-h-screen bg-[#F5F3EE]">
      <aside className="w-64 bg-[#0F1B33] text-white flex flex-col shrink-0">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-[#C6992F] text-[#0F1B33] font-bold text-xs flex items-center justify-center shrink-0">
            SMK
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">SMK Citra Negara</p>
            <p className="text-[11px] text-white/50">{subtitle}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setNav(k)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                nav === k ? "bg-[#C6992F] text-[#0F1B33]" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Ico k={k} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 pb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 text-[#C6992F] text-xs font-bold flex items-center justify-center overflow-hidden shrink-0">
              {user.foto ? (
                <img src={user.foto} alt="" className="w-full h-full object-cover" />
              ) : (
                user.nama?.[0]?.toUpperCase()
              )}
            </div>
            <p className="text-xs text-white/70 truncate">{user.nama}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <Ico k="logout" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-8 py-8 max-w-6xl">{render({ user, nav, setNav, setUser })}</main>
    </div>
  );
}