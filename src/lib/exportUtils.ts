/**
 * Export and Document Download Utilities for Veloce Car Rental
 * Zero external dependencies: pure client-side PDF, CSV, and JSON generators
 */

export function downloadBlob(blob: Blob, filename: string) {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number | undefined | null)[][]) {
  const csvContent = [
    headers.map((h) => `"${String(h ?? "").replace(/"/g, '""')}"`).join(","),
    ...rows.map((row) =>
      row.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

export function downloadJson(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" });
  downloadBlob(blob, filename.endsWith(".json") ? filename : `${filename}.json`);
}

function escapePdf(str: string | number | undefined | null): string {
  return String(str ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export interface PdfDocumentOptions {
  title: string;
  subtitle?: string;
  refNumber?: string;
  date?: string;
  badge?: string;
  details?: [string, string | number][];
  sections?: { title: string; lines: string[] }[];
  table?: {
    headers: string[];
    rows: (string | number)[][];
    widths?: number[];
  };
}

export function buildPdfBlob(opts: PdfDocumentOptions): Blob {
  const { title, subtitle, refNumber, date, badge, details, sections, table } = opts;
  const contentOps: string[] = [];

  // Top Accent Bar (Veloce Brand Orange)
  contentOps.push("1 0.42 0 rg 40 802 515 4 re f");

  // Top Metadata & Brand Header
  contentOps.push("BT /F2 9 Tf 0.4 0.4 0.4 rg 40 786 Td (VELOCE CAR RENTAL ENTERPRISE - OFFICIAL LOGISTICS REPORT) Tj ET");

  // Document Title
  contentOps.push(`BT /F2 16 Tf 0.08 0.08 0.08 rg 40 762 Td (${escapePdf(title)}) Tj ET`);

  // Subtitle
  if (subtitle) {
    contentOps.push(`BT /F1 10 Tf 0.35 0.35 0.35 rg 40 745 Td (${escapePdf(subtitle)}) Tj ET`);
  }

  // Meta box header
  contentOps.push("0.96 0.97 0.98 rg 40 682 515 48 re f");
  contentOps.push("0.85 0.88 0.91 RG 1 w 40 682 515 48 re S");

  let metaX = 52;
  if (refNumber) {
    contentOps.push(`BT /F2 8 Tf 0.45 0.45 0.45 rg ${metaX} 714 Td (DOCUMENT REF #) Tj ET`);
    contentOps.push(`BT /F2 10 Tf 0.1 0.1 0.1 rg ${metaX} 697 Td (${escapePdf(refNumber)}) Tj ET`);
  }
  metaX += 160;
  if (date) {
    contentOps.push(`BT /F2 8 Tf 0.45 0.45 0.45 rg ${metaX} 714 Td (AUDIT / ISSUE DATE) Tj ET`);
    contentOps.push(`BT /F1 10 Tf 0.1 0.1 0.1 rg ${metaX} 697 Td (${escapePdf(date)}) Tj ET`);
  }
  metaX += 160;
  contentOps.push(`BT /F2 8 Tf 0.45 0.45 0.45 rg ${metaX} 714 Td (AUTHORIZATION STATUS) Tj ET`);
  contentOps.push(`BT /F2 10 Tf 0.06 0.60 0.30 rg ${metaX} 697 Td (${escapePdf(badge || "CERTIFIED & AUDITED")}) Tj ET`);

  let currentY = 650;

  // Key Details Grid
  if (details && details.length > 0) {
    contentOps.push(`BT /F2 11 Tf 0.1 0.1 0.1 rg 40 ${currentY} Td (Audit & Technical Specifications) Tj ET`);
    currentY -= 15;

    for (let i = 0; i < details.length; i++) {
      const [key, val] = details[i];
      const isAlt = i % 2 === 1;
      if (isAlt) {
        contentOps.push(`0.97 0.97 0.98 rg 40 ${currentY - 4} 515 18 re f`);
      }
      contentOps.push(`0.90 0.90 0.92 RG 0.5 w 40 ${currentY - 4} 515 18 re S`);
      contentOps.push(`BT /F2 9 Tf 0.30 0.30 0.30 rg 48 ${currentY} Td (${escapePdf(key)}) Tj ET`);
      contentOps.push(`BT /F1 9 Tf 0.05 0.05 0.05 rg 210 ${currentY} Td (${escapePdf(val)}) Tj ET`);
      currentY -= 20;
    }
    currentY -= 10;
  }

  // Sections
  if (sections && sections.length > 0) {
    for (const sec of sections) {
      if (currentY < 120) break;
      contentOps.push(`BT /F2 11 Tf 0.1 0.1 0.1 rg 40 ${currentY} Td (${escapePdf(sec.title)}) Tj ET`);
      currentY -= 14;
      for (const line of sec.lines) {
        if (currentY < 90) break;
        contentOps.push(`BT /F1 9 Tf 0.25 0.25 0.25 rg 48 ${currentY} Td (${escapePdf(line)}) Tj ET`);
        currentY -= 14;
      }
      currentY -= 10;
    }
  }

  // Data Table (if provided)
  if (table && table.headers.length > 0 && currentY > 120) {
    contentOps.push(`BT /F2 11 Tf 0.1 0.1 0.1 rg 40 ${currentY} Td (Rental Operational Ledger) Tj ET`);
    currentY -= 16;

    const colWidths = table.widths || table.headers.map(() => 515 / table.headers.length);

    // Table Header Row
    contentOps.push(`0.92 0.94 0.96 rg 40 ${currentY - 3} 515 16 re f`);
    contentOps.push(`0.80 0.83 0.87 RG 0.7 w 40 ${currentY - 3} 515 16 re S`);

    let curColX = 45;
    for (let c = 0; c < table.headers.length; c++) {
      contentOps.push(`BT /F2 8 Tf 0.2 0.2 0.2 rg ${curColX} ${currentY} Td (${escapePdf(table.headers[c])}) Tj ET`);
      curColX += colWidths[c];
    }
    currentY -= 18;

    // Table Data Rows
    for (let r = 0; r < table.rows.length; r++) {
      if (currentY < 80) break;
      const row = table.rows[r];
      if (r % 2 === 1) {
        contentOps.push(`0.98 0.98 0.99 rg 40 ${currentY - 3} 515 15 re f`);
      }
      contentOps.push(`0.90 0.91 0.93 RG 0.5 w 40 ${currentY - 3} 515 15 re S`);

      let cellX = 45;
      for (let c = 0; c < row.length; c++) {
        contentOps.push(`BT /F1 8 Tf 0.1 0.1 0.1 rg ${cellX} ${currentY} Td (${escapePdf(row[c])}) Tj ET`);
        cellX += colWidths[c];
      }
      currentY -= 16;
    }
  }

  // Official Seal & Footer
  contentOps.push("0.85 0.88 0.91 RG 0.5 w 40 50 515 0.5 re S");
  contentOps.push("BT /F1 8 Tf 0.5 0.5 0.5 rg 40 38 Td (Generated directly via Veloce Cloud Management System. Valid digitally without physical stamp.) Tj ET");
  contentOps.push("BT /F2 8 Tf 1 0.42 0 rg 470 38 Td (ENTERPRISE AUDIT) Tj ET");

  const contentStream = contentOps.join("\n");
  const streamLen = new TextEncoder().encode(contentStream).length;

  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
  objects.push("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj");
  objects.push("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj");
  objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj");
  objects.push(`6 0 obj\n<< /Length ${streamLen} >>\nstream\n${contentStream}\nendstream\nendobj`);

  const header = "%PDF-1.4\n";
  let body = "";
  const offsets: number[] = [];
  let currentOffset = new TextEncoder().encode(header).length;

  for (let i = 0; i < objects.length; i++) {
    offsets.push(currentOffset);
    const objStr = objects[i] + "\n";
    body += objStr;
    currentOffset += new TextEncoder().encode(objStr).length;
  }

  const startXref = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    xref += String(offset).padStart(10, "0") + " 00000 n \n";
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
  const pdfString = header + body + xref + trailer;

  return new Blob([pdfString], { type: "application/pdf" });
}

export function downloadMaintenanceDocumentPdf(doc: {
  title: string;
  vehicle: string;
  date: string;
  ref: string;
  size?: string;
  supplier?: string;
  batch?: string;
  warrantyPeriod?: string;
  checkpoints?: string[];
  certifiedBy?: string;
}) {
  const blob = buildPdfBlob({
    title: doc.title,
    subtitle: `Target Vehicle / Unit: ${doc.vehicle}`,
    refNumber: doc.ref,
    date: doc.date,
    badge: "WORKSHOP VERIFIED",
    details: [
      ["Component / Procedure", doc.title],
      ["Assigned Fleet Vehicle", doc.vehicle],
      ["OEM Parts Supplier", doc.supplier || "Veloce Certified Spares Hub"],
      ["Serial / Batch Code", doc.batch || `${doc.ref}-BATCH-01`],
      ["Warranty / Coverage Term", doc.warrantyPeriod || "24 Months / 40,000 KM Replacement Warranty"],
      ["Technical Certifier", doc.certifiedBy || "Chief Fleet Inspector & Diagnostics Lead"],
    ],
    sections: [
      {
        title: "Quality Checkpoints & Sensor Diagnostics Verification",
        lines: doc.checkpoints || [
          "1. Torque specifications calibrated to factory OEM workshop standards.",
          "2. Pressure decay and fluid leakage inspection passed without variance.",
          "3. OBD-II diagnostics scan completed with zero active trouble codes.",
          "4. Dynamic road handling verification test signed off by technician.",
        ],
      },
    ],
  });

  const safeFilename = `${doc.ref}_${doc.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  downloadBlob(blob, safeFilename);
}

export function downloadAdminRentalsCsv(bookings: any[], fleet: any[]) {
  const headers = [
    "Booking Code",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Vehicle Make & Model",
    "Vehicle Reg Number",
    "Category",
    "Transmission",
    "Fuel Type",
    "Daily Rate (INR)",
    "Start Date",
    "End Date",
    "Rental Days",
    "Base Amount (INR)",
    "Security Deposit (INR)",
    "Total Cost (INR)",
    "Payment Method",
    "Payment Status",
    "Booking Status",
    "Created Date",
  ];

  const rows = bookings.map((b) => {
    const v = fleet.find((car) => car.id === b.vehicleId) || {};
    const sDate = new Date(b.startDate);
    const eDate = new Date(b.endDate);
    const days = Math.max(1, Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)));

    return [
      b.bookingCode || `BK-${b.id}`,
      b.customerName || "N/A",
      b.customerEmail || "N/A",
      b.customerPhone || "N/A",
      b.vehicleName || `${v.make || ""} ${v.model || ""}`.trim() || "Fleet Car",
      v.registrationNumber || "MH01AB1001",
      v.category || "Standard",
      v.transmission || "Automatic",
      v.fuelType || "Petrol",
      v.dailyRate || "2500",
      b.startDate ? new Date(b.startDate).toLocaleDateString() : "",
      b.endDate ? new Date(b.endDate).toLocaleDateString() : "",
      days,
      b.totalCost ? Math.round(Number(b.totalCost) * 0.8) : 0,
      b.securityDeposit || 5000,
      b.totalCost || 0,
      b.paymentMethod || "Card",
      b.paymentStatus || "paid",
      b.status || "confirmed",
      b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "",
    ];
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadCsv(`Veloce_Rental_Bookings_Master_${timestamp}.csv`, headers, rows);
}

export function downloadAdminRentalsPdf(bookings: any[], fleet: any[]) {
  const totalRev = bookings.reduce((sum, b) => sum + (b.paymentStatus === "paid" ? Number(b.totalCost) : 0), 0);
  const activeCount = bookings.filter((b) => b.status === "active").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  const tableHeaders = ["Code", "Customer", "Vehicle", "Dates", "Total", "Status"];
  const tableWidths = [70, 105, 115, 95, 65, 65];

  const tableRows = bookings.slice(0, 14).map((b) => [
    `#${b.bookingCode || b.id}`,
    (b.customerName || "Customer").slice(0, 14),
    (b.vehicleName || "Car").slice(0, 16),
    `${new Date(b.startDate).toLocaleDateString().slice(0, 5)} - ${new Date(b.endDate).toLocaleDateString().slice(0, 5)}`,
    `INR ${Number(b.totalCost).toLocaleString()}`,
    String(b.status).toUpperCase(),
  ]);

  const blob = buildPdfBlob({
    title: "Executive Car Rental Ledger & Fleet Audit",
    subtitle: `Total Bookings: ${bookings.length} | Fleet Active Vehicles: ${fleet.length}`,
    refNumber: `AUDIT-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().slice(0, 10),
    badge: "EXECUTIVE AUDIT",
    details: [
      ["Total Gross Rental Revenue", `INR ${totalRev.toLocaleString()}`],
      ["Dispatched / Active Rentals", `${activeCount} On Road`],
      ["Completed Rental Returns", `${completedCount} Trips Closed`],
      ["Operational Fleet Capacity", `${fleet.length} Vehicles`],
      ["Audited By", "Veloce Executive System Administrator"],
    ],
    table: {
      headers: tableHeaders,
      rows: tableRows,
      widths: tableWidths,
    },
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `Veloce_Rental_Executive_Report_${timestamp}.pdf`);
}

export function downloadAdminAllDataJson(bookings: any[], fleet: any[], users: any[], maintenanceJobs: any[]) {
  const fullPayload = {
    exportedAt: new Date().toISOString(),
    system: "Veloce Car Rental Enterprise ERP",
    version: "2.4.0",
    metrics: {
      totalBookings: bookings.length,
      totalVehicles: fleet.length,
      totalUsers: users.length,
      totalMaintenanceJobs: maintenanceJobs.length,
      grossRevenue: bookings.reduce((sum, b) => sum + (b.paymentStatus === "paid" ? Number(b.totalCost) : 0), 0),
    },
    bookings,
    fleet,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      verified: u.verified,
    })),
    maintenanceJobs,
  };

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadJson(`Veloce_Complete_Rental_Database_${timestamp}.json`, fullPayload);
}
