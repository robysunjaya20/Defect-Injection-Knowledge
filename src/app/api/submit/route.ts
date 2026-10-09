
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyIvNvllawLt3s9CtpBKQAZzTz4ECqa6K-tCE5UTExiLp549TPDa71fPVwv_qS2o-Vi/exec";

const ALLOWED_DEPARTMENTS = [
  "IQC",
  "IPQC",
  "OQC",
  "MIRROR ASSY",
  "SEAT ASSY",
  "INJECTION",
  "MC",
];

export async function POST(request: NextRequest) {
  try {
    if (
      GOOGLE_SCRIPT_URL.includes(
        "PASTE_DEPLOYMENT_ID_HERE"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "URL Google Apps Script belum diatur.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      testType,
      nama,
      nik,
      department,
      tanggal,
      email,
      defects,
    } = body ?? {};

    // Validasi jenis tes.
    if (
      testType !== "PreTest" &&
      testType !== "PostTest"
    ) {
      return NextResponse.json(
        { success: false, error: "Jenis tes tidak valid." },
        { status: 400 }
      );
    }

    // Validasi nama.
    if (
      typeof nama !== "string" ||
      !nama.trim() ||
      nama.length > 120
    ) {
      return NextResponse.json(
        { success: false, error: "Nama wajib diisi." },
        { status: 400 }
      );
    }

    // Validasi NIK.
    if (
      typeof nik !== "string" ||
      !nik.trim() ||
      nik.length > 50
    ) {
      return NextResponse.json(
        { success: false, error: "NIK wajib diisi." },
        { status: 400 }
      );
    }

    // Validasi department.
    if (
      typeof department !== "string" ||
      !ALLOWED_DEPARTMENTS.includes(department)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Department tidak valid.",
        },
        { status: 400 }
      );
    }

    // Validasi tanggal.
    if (
      typeof tanggal !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Format tanggal tidak valid.",
        },
        { status: 400 }
      );
    }

    const parsedDate = new Date(
      `${tanggal}T00:00:00.000Z`
    );

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== tanggal
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Tanggal tidak valid.",
        },
        { status: 400 }
      );
    }

    if (
      typeof email !== "string" ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Email tidak valid.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(defects) ||
      defects.length < 1 ||
      defects.length > 100 ||
      defects.some(
        (defect: unknown) =>
          typeof defect !== "string" ||
          !defect.trim() ||
          defect.length > 300
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Isi minimal satu defect yang valid.",
        },
        { status: 400 }
      );
    }

    const payload = {
      testType,
      nama: nama.trim(),
      nik: nik.trim(),
      department,
      tanggal,
      email: email.trim(),
      defects: defects.map(
        (defect: string) => defect.trim()
      ),
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Google Apps Script gagal dihubungi. Periksa deployment dan izin akses.",
        },
        { status: 502 }
      );
    }

    const result = await response.json().catch(
      () => null
    );

    if (!result || result.success !== true) {
      return NextResponse.json(
        {
          success: false,
          dataSaved: result?.dataSaved === true,
          error:
            result?.error ||
            "Google Apps Script tidak mengonfirmasi keberhasilan.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        result.message || "Jawaban berhasil disimpan.",
      certificateUrl:
        testType === "PostTest"
          ? result.certificateUrl || null
          : null,
      emailSent:
        testType === "PostTest"
          ? result.emailSent === true
          : null,
    });
  } catch (error) {
    console.error("Submit error:", error);

    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" ||
        error.name === "AbortError");

    return NextResponse.json(
      {
        success: false,
        error: isTimeout
          ? "Proses terlalu lama. Periksa Google Sheets sebelum mencoba mengirim ulang."
          : "Terjadi kesalahan saat mengirim jawaban.",
      },
      { status: 500 }
    );
  }
}
