"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await res.json();

      if (!result.success) {
        setErrorMsg(result.message || "Username atau password salah");
        setIsLoading(false);
        return;
      }

      // Login berhasil — simpan data user biar bisa dipakai di halaman lain
      localStorage.setItem("lms_user", JSON.stringify(result.data));

      // Arahkan ke halaman sesuai role (sesuaikan path-nya nanti)
      const roleRedirect = {
        admin: "/admin",
        guru: "/guru",
        siswa: "/siswa",
        kepsek: "/kepsek",
        kurikulum: "/kurikulum",
      };
      router.push(roleRedirect[result.data.role] || "/");
    } catch (err) {
      setErrorMsg("Tidak bisa terhubung ke server. Coba lagi.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1B33] px-4 py-12 relative overflow-hidden">
      {/* Cahaya lembut di belakang kartu */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #C6992F 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-sm">
        <div className="bg-[#FAF8F3] rounded-2xl shadow-2xl px-8 py-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#0F1B33] flex items-center justify-center text-[#C6992F] font-bold text-2xl border-2 border-[#C6992F]">
              SMK
            </div>
          </div>

          {/* Sambutan */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-[#0F1B33] mb-1">
              Selamat datang kembali
            </h1>
            <p className="text-sm text-[#6B7280]">
              Masuk untuk melanjutkan ke LMS
            </p>
          </div>

          {/* Pesan error */}
          {errorMsg && (
            <div className="mb-5 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[#1F2430] mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-[#1F2430] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C6992F] focus:border-transparent transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#1F2430] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-[#1F2430] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C6992F] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-[#0F1B33] text-white font-semibold hover:bg-[#C6992F] hover:text-[#0F1B33] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Login"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#E5E0D5] text-center">
            <p className="text-sm font-semibold text-[#0F1B33]">
              LMS SMK Citra Negara
            </p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Platform pembelajaran digital terintegrasi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}