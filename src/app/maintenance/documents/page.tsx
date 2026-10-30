"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { downloadMaintenanceDocumentPdf } from "@/lib/exportUtils";
import { useToast } from "@/components/portal/Toast";

export default function MaintenanceDocumentsPage() {
  const { success } = useToast();
  const [downloadingRef, setDownloadingRef] = useState<string | null>(null);

  const documents = [
    {
      title: "Brembo Ceramic Brake Kit Warranty Certificate",
      vehicle: "Maruti Swift (MH01AB1005)",
      date: "2024-02-20",
      ref: "DOC-BRK-9921",
      size: "1.4 MB",
      supplier: "Brembo Official India Automotive",
      batch: "BRM-2024-99218-IND",
      warrantyPeriod: "36 Months / 60,000 KM Replacement Warranty",
      checkpoints: [
        "1. Brake caliper mounting bolt torque checked to 110 Nm factory OEM spec.",
        "2. Complete hydraulic line bleed performed; refilled with DOT 4 synthetic fluid.",
        "3. Dynamometer rotor temperature dissipation and runout within 0.02 mm tolerance.",
        "4. High-friction deceleration test verified with zero pad squeal or fade.",
      ],
      certifiedBy: "Senior Workshop Specialist Rajesh K. (ID #304)",
    },
    {
      title: "Off-Road Suspension Geometry Alignment Sheet",
      vehicle: "Mahindra Thar (MH01AB1017)",
      date: "2024-02-18",
      ref: "DOC-SUS-4412",
      size: "2.1 MB",
      supplier: "Veloce Heavy-Duty Suspension Lab",
      batch: "SUS-ALIGN-44120-MH",
      warrantyPeriod: "12 Months / 25,000 KM Geometry Guarantee",
      checkpoints: [
        "1. Front camber angle calibrated to -0.5 deg; toe-in set precisely to +0.10 deg.",
        "2. Rear gas-charged multi-link dampers pressurized to OEM standard 14 bar.",
        "3. Heavy-duty sway bar bushings lubricated with high-temperature silicone grease.",
        "4. High-speed steering rack harmonic vibration test cleared with zero deflection.",
      ],
      certifiedBy: "Fleet Diagnostics Lead Amit S. (ID #212)",
    },
    {
      title: "Tesla High-Voltage Battery Pack Diagnostic Certificate",
      vehicle: "Tesla Model 3 (MH01AB1003)",
      date: "2024-01-30",
      ref: "DOC-EV-1029",
      size: "890 KB",
      supplier: "Tesla Authorized Service Partner India",
      batch: "TSLA-BAT-993821-X",
      warrantyPeriod: "8 Years / 160,000 KM High-Voltage Battery Coverage",
      checkpoints: [
        "1. Total cell pack health verified at 98.4% remaining original capacity.",
        "2. Individual cell-to-cell delta voltage variance strictly within +/- 0.008V.",
        "3. Glycol thermal cooling loop pressure tested and held stable at 2.2 bar.",
        "4. BMS (Battery Management System) firmware updated and telemetry synchronized.",
      ],
      certifiedBy: "Master EV Powertrain Specialist Vikram P. (ID #108)",
    },
    {
      title: "Toyota Synthetic 5W-30 Oil Batch Quality Signoff",
      vehicle: "Fleet Bulk Inventory",
      date: "2024-01-15",
      ref: "DOC-OIL-0021",
      size: "640 KB",
      supplier: "Toyota Genuine Motor Oil Supply",
      batch: "TGMO-5W30-BATCH-0082",
      warrantyPeriod: "10,000 KM Drain Interval Quality Guarantee",
      checkpoints: [
        "1. Viscosity index verified at 162 via standardized ASTM D2270 method.",
        "2. TBN (Total Base Number) measured at 8.8 mg KOH/g for sustained acid neutralization.",
        "3. Bulk supply tamper seals inspected and logged prior to distribution.",
        "4. Laboratory spectrometry scan cleared: 0% particulate or moisture contamination.",
      ],
      certifiedBy: "Quality Assurance Chemist Meera N. (ID #142)",
    },
  ];

  function handleDownload(doc: typeof documents[0]) {
    setDownloadingRef(doc.ref);
    try {
      downloadMaintenanceDocumentPdf(doc);
      success("Document Downloaded", `${doc.title} (.pdf) has been downloaded to your device.`);
    } finally {
      setTimeout(() => setDownloadingRef(null), 600);
    }
  }

  function handleDownloadAll() {
    documents.forEach((doc, i) => {
      setTimeout(() => {
        downloadMaintenanceDocumentPdf(doc);
      }, i * 350);
    });
    success("Batch Download Started", `Downloading all ${documents.length} verified workshop certificates.`);
  }

  return (
    <PortalShell
      activeRole="maintenance"
      pageTitle="Workshop Documents & Warranty Certs"
      breadcrumb={[{ label: "Documents" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Parts Warranties & Diagnostic Reports</h2>
            <p className="text-xs text-soft">
              Archived component warranty certificates, supplier signoffs, and vehicle diagnostic sheets. Download official PDFs directly to your computer.
            </p>
          </div>

          <button
            onClick={handleDownloadAll}
            className="btn-primary px-4 py-2 text-xs font-bold shadow-sm self-start sm:self-auto flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Download All ({documents.length} Docs)</span>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {documents.map((doc, idx) => {
            const isDownloading = downloadingRef === doc.ref;

            return (
              <div key={idx} className="card rounded-3xl p-5 border border-app space-y-3 flex flex-col justify-between hover:border-orange/40 transition shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-app">
                    <div>
                      <h3 className="font-bold text-app text-xs leading-snug">{doc.title}</h3>
                      <span className="text-[10px] text-soft font-mono mt-0.5 block">{doc.ref}</span>
                    </div>
                    <span className="text-2xl shrink-0">📄</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-soft mt-3">
                    <p><span className="font-semibold text-app">Target Unit:</span> {doc.vehicle}</p>
                    <p><span className="font-semibold text-app">Supplier:</span> {doc.supplier}</p>
                    <p><span className="font-semibold text-app">Archived Date:</span> {doc.date}</p>
                    <p><span className="font-semibold text-app">Warranty:</span> {doc.warrantyPeriod}</p>
                    <p><span className="font-semibold text-app">File Format:</span> Official PDF ({doc.size})</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-app/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    ✓ Verified & Signed
                  </span>
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={isDownloading}
                    className="btn-ghost px-3.5 py-1.5 text-xs font-bold text-orange hover:!border-orange hover:bg-orange/10 flex items-center gap-1.5 transition"
                  >
                    <span>{isDownloading ? "⏳" : "📥"}</span>
                    <span>{isDownloading ? "Generating..." : "Download PDF"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PortalShell>
  );
}
