"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import { useToast } from "@/components/portal/Toast";

import { useAuth } from "@/components/AuthProvider";

export default function CustomerDocumentsPage() {
  const { user } = useAuth();
  const { bookings, actions } = useRentalStore();
  const { success, info } = useToast();

  const currentUserId = user?.id || user?.userId;
  const currentUserEmail = user?.email?.toLowerCase();

  const [form, setForm] = useState({
    licenseNumber: "DL-9981234",
    idNumber: "ID-908122",
    licenseExpiry: "2029-08-15",
    docType: "Driver License",
  });
  const [uploadedFront, setUploadedFront] = useState("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80");
  const [uploading, setUploading] = useState(false);

  // Active customer booking driver status for logged-in user
  const activeBooking = bookings.find(
    (b) =>
      (currentUserId && b.customerId === currentUserId) ||
      (currentUserEmail && b.customerEmail?.toLowerCase() === currentUserEmail)
  );
  const driverKyc = activeBooking?.driver;

  function handleReupload(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      if (activeBooking) {
        actions.submitDriverDocument(activeBooking.id, {
          name: user?.name || "Customer",
          licenseNumber: form.licenseNumber,
          idNumber: form.idNumber,
          licenseExpiry: form.licenseExpiry,
          licenseFrontUrl: uploadedFront,
        });
      }
      success("Document Submitted!", "Your updated identification has been sent to staff for review.");
    }, 800);
  }

  return (
    <PortalShell
      activeRole="customer"
      pageTitle="KYC & Driver Verification"
      breadcrumb={[{ label: "Documents" }]}
    >
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Digital Identity & License Verification</h2>
            <p className="text-xs text-soft">
              Mandatory government-issued driving license and national identity verification before key handover.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-500">
              KYC Status: Verified ✓
            </span>
          </div>
        </div>

        {/* Verification Status Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card rounded-2xl p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-soft block">Document Type</span>
            <span className="text-sm font-black text-app mt-1 block">Government Driver License</span>
            <span className="text-[11px] text-soft">DL-9981234</span>
          </div>
          <div className="card rounded-2xl p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-soft block">Verification Result</span>
            <span className="text-sm font-black text-emerald-500 mt-1 block">Certified & Valid</span>
            <span className="text-[11px] text-soft">Expires: 2029-08-15</span>
          </div>
          <div className="card rounded-2xl p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-soft block">Inspected By</span>
            <span className="text-sm font-black text-app mt-1 block">Rachel Green</span>
            <span className="text-[11px] text-soft">Front Desk Operations</span>
          </div>
        </div>

        {/* Document Preview & Re-Upload Form */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card Preview */}
          <div className="card rounded-3xl p-6 border border-app space-y-4">
            <h3 className="font-bold text-app text-sm">Archived License Scan</h3>
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-900 border border-app shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedFront}
                alt="License Preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-white text-xs">
                  <span className="font-bold block">{user?.name || "Verified Driver"}</span>
                  <span className="text-[11px] opacity-80">{form.licenseNumber} · Class LMV</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-soft/50 p-4 border border-app text-xs space-y-1 text-soft">
              <span className="font-bold text-app block">Staff Verification Log:</span>
              <p>• Verified against national transport database.</p>
              <p>• Clean driving record with zero active demerits.</p>
              <p>• Digital signature captured on rental handover.</p>
            </div>
          </div>

          {/* Form to Update/Re-upload */}
          <div className="card rounded-3xl p-6 border border-app">
            <h3 className="font-bold text-app text-sm mb-1">Update Document Details</h3>
            <p className="text-xs text-soft mb-5">
              If your license was renewed or rejected, submit the latest particulars below.
            </p>

            <form onSubmit={handleReupload} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-app">Full Legal Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || "Customer"}
                  required
                  className="input w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-app">Driver License Number</label>
                <input
                  type="text"
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  required
                  className="input w-full px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-app">National ID / Passport #</label>
                  <input
                    type="text"
                    value={form.idNumber}
                    onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                    required
                    className="input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-app">Expiry Date</label>
                  <input
                    type="date"
                    value={form.licenseExpiry}
                    onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
                    required
                    className="input w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Upload Dropzone Simulation */}
              <div>
                <label className="mb-1 block font-bold text-app">Upload High-Res Scan / Photo</label>
                <div
                  onClick={() => info("Upload Simulation", "Sample ID scan selected.")}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-app p-6 bg-soft/40 hover:border-orange cursor-pointer transition"
                >
                  <span className="text-2xl mb-1">📸</span>
                  <span className="font-bold text-app text-xs">Click to browse or drop file here</span>
                  <span className="text-[10px] text-soft mt-0.5">JPG, PNG, or PDF up to 10MB</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="btn-primary w-full py-2.5 text-xs font-bold shadow-md disabled:opacity-50"
              >
                {uploading ? "Submitting to Staff…" : "Submit for Verification"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
