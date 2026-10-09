
import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero-card home-card">
        <div className="eyebrow">
          BEI • LEARNING CENTER
        </div>

        <h1>Basic Defect Knowledge</h1>

        <p className="lead">Injection</p>

        <p className="muted">
          Silakan pilih formulir sesuai tahapan training.
          Pastikan identitas dan jawaban sudah benar
          sebelum dikirim.
        </p>

        <div className="choice-grid">
          <Link
            className="choice-card"
            href="/pretest"
          >
            <span className="choice-icon">01</span>

            <span>
              <strong>Pre-Test</strong>
              <small>Diisi sebelum training</small>
            </span>

            <span className="arrow">↗</span>
          </Link>

          <Link
            className="choice-card"
            href="/posttest"
          >
            <span className="choice-icon">02</span>

            <span>
              <strong>Post-Test</strong>
              <small>Diisi setelah training</small>
            </span>

            <span className="arrow">↗</span>
          </Link>
        </div>
      </section>

      <footer>
        Basic Defect Knowledge • Injection
      </footer>
    </main>
  );
}
