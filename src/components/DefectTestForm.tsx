
"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type Department =
  | "IQC"
  | "IPQC"
  | "OQC"
  | "MIRROR ASSY"
  | "SEAT ASSY"
  | "INJECTION"
  | "MC";

type TestType = "PreTest" | "PostTest";

type Props = {
  testType: TestType;
  title: string;
  description: string;
};

const departments: Department[] = [
  "IQC",
  "IPQC",
  "OQC",
  "MIRROR ASSY",
  "SEAT ASSY",
  "INJECTION",
  "MC",
];

function getTodayDate(): string {
  const now = new Date();

  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 10);
}

export default function DefectTestForm({
  testType,
  title,
  description,
}: Props) {
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [department, setDepartment] = useState<
    Department | ""
  >("");

  // Kosong saat render awal agar aman untuk prerender.
  const [tanggal, setTanggal] = useState("");

  const [email, setEmail] = useState("");
  const [defects, setDefects] = useState<string[]>([""]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Isi tanggal setelah komponen dimuat di browser.
  useEffect(() => {
    setTanggal(getTodayDate());
  }, []);

  function handleDefectChange(
    index: number,
    value: string
  ) {
    setDefects((current) =>
      current.map((defect, i) =>
        i === index ? value : defect
      )
    );
  }

  function addDefect() {
    setDefects((current) => [...current, ""]);
  }

  function removeDefect(index: number) {
    setDefects((current) => {
      if (current.length === 1) {
        return [""];
      }

      return current.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    const answers = defects
      .map((defect) => defect.trim())
      .filter((defect) => defect.length > 0);

    if (answers.length === 0) {
      setMessage("Isi minimal satu jawaban defect.");
      return;
    }

    if (!tanggal) {
      setMessage("Tanggal pengisian belum tersedia.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testType,
          nama: nama.trim(),
          nik: nik.trim(),
          department,
          tanggal,
          email: email.trim(),
          defects: answers,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Data gagal dikirim."
        );
      }

      setSuccess(true);
      setMessage(
        "Jawaban berhasil dikirim. Terima kasih sudah mengisi formulir."
      );

      setNama("");
      setNik("");
      setDepartment("");
      setTanggal(getTodayDate());
      setEmail("");
      setDefects([""]);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      setSuccess(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengirim data."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="topbar">
        <Link href="/" className="back-link">
          ← Beranda
        </Link>

        <span className="topbar-label">
          BUMJIN LEARNING CENTER
        </span>
      </div>

      <section className="form-card">
        <div className="form-heading">
          <div className="eyebrow">
            {testType === "PreTest"
              ? "BASIC DEFECT KNOWLEDGE"
              : "BASIC DEFECT KNOWLEDGE"}
          </div>

          <h1>{title} Defect Injection</h1>

          <p className="muted">{description}</p>

          <div className="required-note">
            <span>*</span> Wajib diisi
          </div>
        </div>

        {message && (
          <div
            className={`notice ${
              success ? "success" : "error"
            }`}
            role="status"
            aria-live="polite"
          >
            <strong>
              {success ? "Berhasil" : "Informasi"}
            </strong>

            <span>{message}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="test-form"
        >
          <div className="form-grid">
            <label className="field">
              <span>
                Nama lengkap <b>*</b>
              </span>

              <input
                type="text"
                value={nama}
                onChange={(event) =>
                  setNama(event.target.value)
                }
                placeholder="Masukkan nama lengkap"
                autoComplete="name"
                maxLength={120}
                required
              />
            </label>

            <label className="field">
              <span>
                NIK <b>*</b>
              </span>

              <input
                type="text"
                value={nik}
                onChange={(event) =>
                  setNik(event.target.value)
                }
                placeholder="Masukkan NIK"
                maxLength={50}
                required
              />
            </label>

            <label className="field">
              <span>
                Department <b>*</b>
              </span>

              <select
                value={department}
                onChange={(event) =>
                  setDepartment(
                    event.target.value as Department | ""
                  )
                }
                required
              >
                <option value="" disabled>
                  Pilih department
                </option>

                {departments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>
                Tanggal pengisian <b>*</b>
              </span>

              <input
                type="date"
                value={tanggal}
                onChange={(event) =>
                  setTanggal(event.target.value)
                }
                required
              />
            </label>

            <label className="field full-width">
              <span>
                Email <b>*</b>
              </span>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="nama@gmail.com"
                autoComplete="email"
                maxLength={254}
                required
              />
            </label>
          </div>

          <div className="question-section">
            <div className="question-number">
              PERTANYAAN 01
            </div>

            <h2>
              Sebutkan Defect-Defect Injection Yang Kamu
              Ketahui! Minimal 20!
            </h2>

            <p className="muted">
              Tuliskan satu jenis defect pada setiap kolom.
              Klik tombol tambah untuk menambahkan jawaban.
            </p>
          </div>

          <div className="defect-list">
            {defects.map((defect, index) => (
              <div
                className="defect-row"
                key={index}
              >
                <div className="number-badge">
                  {index + 1}
                </div>

                <input
                  type="text"
                  aria-label={`Defect ${index + 1}`}
                  value={defect}
                  onChange={(event) =>
                    handleDefectChange(
                      index,
                      event.target.value
                    )
                  }
                  placeholder={`Tuliskan defect ke-${index + 1}`}
                  maxLength={300}
                />

                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeDefect(index)}
                  aria-label={`Hapus defect ${index + 1}`}
                  title="Hapus jawaban"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="add-button"
            onClick={addDefect}
          >
            + Tambah Defect
          </button>

          <div className="form-footer">
            <p>
              Periksa kembali jawaban sebelum mengirim.
            </p>

            <button
              type="submit"
              className="submit-button"
              disabled={loading || !tanggal}
            >
              {loading
                ? "Mengirim..."
                : "Kirim Jawaban →"}
            </button>
          </div>
        </form>
      </section>

      <footer>
        Defect Injection Knowledge by Roby
      </footer>
    </main>
  );
}
