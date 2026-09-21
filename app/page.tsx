import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">
      {/* HEADER */}
      <header className="header">
        <div className="school-brand">
          <Image
            src="/logo.png"
            alt="Logo SMK Citra Negara"
            width={100}
            height={100}
            className="school-logo"
          />

          <h2>SMK CITRA NEGARA</h2>
        </div>
      </header>

      {/* BENTUK DARK DI KANAN ATAS */}
      <div className="top-shape"></div>

      {/* CONTENT */}
      <section className="hero">
        {/* BAGIAN KIRI */}
        <div className="hero-content">
          <h1>
            LEARNING
            <br />
            MANAGEMENT SYSTEM
            <br />
            SMK CITRA NEGARA
          </h1>

          <p>
            Satu platform digital untuk mendukung
            <br />
            proses pembelajaran kolaborasi dan
            <br />
            pengelolaan akademik bagi seluruh warga
            <br />
            sekolah
          </p>

          <Link href="/login">
            <button className="start-button">
              mulai belajar
            </button>
          </Link>
        </div>

        {/* BAGIAN KANAN */}
        <div className="hero-image">
          <Image
            src="/ilustrasi.png"
            alt="Ilustrasi pembelajaran"
            width={760}
            height={560}
            priority
          />
        </div>
      </section>
    </main>
  );
}