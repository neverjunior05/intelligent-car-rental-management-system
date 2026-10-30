"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import Modal from "@/components/portal/Modal";
import Drawer from "@/components/portal/Drawer";
import { useToast } from "@/components/portal/Toast";
import { api } from "@/lib/api";

export default function AdminUsersPage() {
  const { users, actions } = useRentalStore();
  const { success, warning } = useToast();

  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // New user form state including password
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff" as "customer" | "staff" | "maintenance" | "admin",
    phone: "",
    department: "Front Desk Operations",
    licenseNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drawer password update state
  const [resettingPassword, setResettingPassword] = useState(false);
  const [drawerNewPassword, setDrawerNewPassword] = useState("");
  const [showDrawerPassword, setShowDrawerPassword] = useState(false);

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  function generatePassword(target: "form" | "drawer") {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (target === "form") {
      setForm((prev) => ({ ...prev, password: pwd }));
      setShowPassword(true);
    } else {
      setDrawerNewPassword(pwd);
      setShowDrawerPassword(true);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.password || form.password.length < 6) {
      warning("Password Required", "Please enter an account password of at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Persist directly to MongoDB database
      const data = await api<{ user: { id: number; name: string; email: string; role: string } }>("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          phone: form.phone,
          department: form.department,
          licenseNumber: form.licenseNumber || undefined,
        }),
      });

      // 2. Sync into client reactive store with assigned ID
      actions.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        department: form.department,
        licenseNumber: form.licenseNumber || undefined,
        status: "active",
        lastLogin: "Never",
      });

      setCreateModalOpen(false);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "staff",
        phone: "",
        department: "Front Desk Operations",
        licenseNumber: "",
      });
      setShowPassword(false);
      success("User Account Created!", `Account for ${form.name} (${form.role.toUpperCase()}) saved to database with configured password.`);
    } catch (err: any) {
      warning("Failed to Create User", err?.message || "Could not save user account to database.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveNewPassword() {
    if (!drawerNewPassword || drawerNewPassword.length < 6) {
      warning("Password Required", "Password must be at least 6 characters long.");
      return;
    }
    if (!selectedUser) return;

    try {
      // Sync to backend MongoDB
      await api("/api/users", {
        method: "PATCH",
        body: JSON.stringify({
          id: selectedUser.id,
          email: selectedUser.email,
          password: drawerNewPassword,
        }),
      });

      actions.updateUser(selectedUser.id, { password: drawerNewPassword });
      setSelectedUser({ ...selectedUser, password: drawerNewPassword });

      success("Password Updated", `New password successfully saved for ${selectedUser.name}.`);
      setResettingPassword(false);
      setDrawerNewPassword("");
      setShowDrawerPassword(false);
    } catch (err: any) {
      warning("Failed to Update Password", err?.message || "Could not update password in database.");
    }
  }

  function handleToggleStatus(userId: number) {
    actions.toggleUserStatus(userId);
    const u = users.find((x) => x.id === userId);
    warning("Account Status Updated", `Account for ${u?.name} status toggled.`);
    if (selectedUser?.id === userId) {
      setSelectedUser({
        ...selectedUser,
        status: selectedUser.status === "active" ? "suspended" : "active",
      });
    }
  }

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="Enterprise User Access & Role RBAC"
      breadcrumb={[{ label: "User Management" }]}
    >
      <div className="space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Internal Accounts & RBAC Directory</h2>
            <p className="text-xs text-soft">
              Provision Rental Staff, Maintenance Technicians, Administrators, and Customer credentials.
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary px-4 py-2 text-xs font-bold self-start sm:self-auto shadow-md"
          >
            + Create New User
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="card rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search user by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full py-2 pl-9 pr-3 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(["all", "staff", "maintenance", "admin", "customer"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition shrink-0 cursor-pointer ${
                  roleFilter === r ? "bg-orange text-white shadow-sm" : "bg-soft text-soft hover:text-app"
                }`}
              >
                {r} ({r === "all" ? users.length : users.filter((u) => u.role === r).length})
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="card rounded-3xl border border-app overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-soft font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role Privileges</th>
                  <th className="p-4">Department / Hub</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Last Activity</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-soft/30 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange/15 font-black text-orange text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-app block">{u.name}</span>
                          <span className="text-[10px] text-soft">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : u.role === "staff"
                              ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                              : u.role === "maintenance"
                                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                : "bg-orange/15 text-orange border border-orange/30"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-soft font-medium">{u.department || "Customer Base"}</td>
                    <td className="p-4 text-soft">{u.phone}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer transition ${
                          u.status === "active"
                            ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25"
                            : "bg-red-500/15 text-red-500 hover:bg-red-500/25"
                        }`}
                        title="Click to toggle account status"
                      >
                        {u.status === "active" ? "Active ●" : "Suspended ○"}
                      </button>
                    </td>
                    <td className="p-4 text-soft">{u.lastLogin || "Today"}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="btn-ghost px-2.5 py-1 text-xs font-semibold"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision Internal User Account"
        subtitle="Administrator Role-Based Access Control"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-bold text-app">Full Legal Name</label>
            <input
              type="text"
              placeholder="e.g. Liam Staff"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="input w-full px-3 py-2 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-app">Email Address</label>
              <input
                type="email"
                placeholder="name@carrent.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="input w-full px-3 py-2 text-xs font-medium"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-app">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 555-019-1122"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="input w-full px-3 py-2 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-app">
                Account Password <span className="text-orange">*</span>
              </label>
              <button
                type="button"
                onClick={() => generatePassword("form")}
                className="text-[11px] font-bold text-orange hover:underline cursor-pointer"
              >
                ⚡ Generate Password
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Set user password (min. 6 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="input w-full px-3 py-2 pr-16 text-xs font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-soft hover:text-app px-2 py-1 rounded cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-[10px] text-soft mt-1">
              The user will use this initial password alongside their email address to sign into the system.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-app">Assigned Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                className="input w-full px-2.5 py-2 text-xs cursor-pointer font-bold"
              >
                <option value="staff">Rental Staff</option>
                <option value="maintenance">Maintenance Staff</option>
                <option value="admin">Administrator</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-bold text-app">Department / Hub</label>
              <input
                type="text"
                placeholder="e.g. Airport Depot"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="input w-full px-3 py-2 text-xs font-medium"
              />
            </div>
          </div>

          {form.role === "customer" && (
            <div>
              <label className="mb-1 block font-bold text-app">Driver License # (Optional)</label>
              <input
                type="text"
                placeholder="DL-XXXXXXX"
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                className="input w-full px-3 py-2 text-xs font-medium"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-app">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(false);
                setForm({
                  name: "",
                  email: "",
                  password: "",
                  role: "staff",
                  phone: "",
                  department: "Front Desk Operations",
                  licenseNumber: "",
                });
                setShowPassword(false);
              }}
              className="btn-ghost px-4 py-2 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-6 py-2 font-bold text-xs shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      {/* User Operations Drawer */}
      <Drawer
        isOpen={!!selectedUser}
        onClose={() => {
          setSelectedUser(null);
          setResettingPassword(false);
          setDrawerNewPassword("");
          setShowDrawerPassword(false);
        }}
        title="User Particulars & RBAC Clearance"
        subtitle={selectedUser?.name}
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-app bg-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange/20 font-black text-orange text-lg">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-app text-sm">{selectedUser.name}</h4>
                <p className="text-soft">{selectedUser.email}</p>
                <span className="font-bold text-orange uppercase text-[10px] mt-1 block">
                  {selectedUser.role} Privileges
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-app p-4 space-y-2 text-soft">
              <div className="flex justify-between">
                <span>Account Status:</span>
                <strong className={selectedUser.status === "active" ? "text-emerald-500 uppercase" : "text-red-500 uppercase"}>
                  {selectedUser.status}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Department:</span>
                <strong className="text-app">{selectedUser.department || "Operations"}</strong>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <strong className="text-app">{selectedUser.phone}</strong>
              </div>
              <div className="flex justify-between">
                <span>Created Date:</span>
                <strong className="text-app">{selectedUser.createdAt}</strong>
              </div>
            </div>

            {/* Security & Password Management in Drawer */}
            <div className="rounded-2xl border border-app p-4 space-y-3 bg-soft/30">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-app text-xs">Security & Password</h5>
                  <p className="text-[10px] text-soft">
                    {selectedUser.password ? "Password configured" : "Default credential configured"}
                  </p>
                </div>
                {!resettingPassword && (
                  <button
                    onClick={() => {
                      setResettingPassword(true);
                      setDrawerNewPassword("");
                    }}
                    className="btn-ghost px-2.5 py-1 text-[11px] font-bold text-orange hover:bg-orange/10"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {resettingPassword && (
                <div className="space-y-2 pt-2 border-t border-app">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-app">New Password</label>
                    <button
                      type="button"
                      onClick={() => generatePassword("drawer")}
                      className="text-[10px] font-bold text-orange hover:underline cursor-pointer"
                    >
                      ⚡ Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showDrawerPassword ? "text" : "password"}
                      placeholder="Enter new password (min. 6 chars)"
                      value={drawerNewPassword}
                      onChange={(e) => setDrawerNewPassword(e.target.value)}
                      className="input w-full px-3 py-1.5 pr-14 text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDrawerPassword(!showDrawerPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-soft hover:text-app px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      {showDrawerPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setResettingPassword(false);
                        setDrawerNewPassword("");
                        setShowDrawerPassword(false);
                      }}
                      className="btn-ghost px-2.5 py-1 text-[11px] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNewPassword}
                      className="btn-primary px-3 py-1 text-[11px] font-bold shadow-sm"
                    >
                      Save Password
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleToggleStatus(selectedUser.id)}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition ${
                  selectedUser.status === "active"
                    ? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white"
                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow"
                }`}
              >
                {selectedUser.status === "active" ? "Suspend User Account" : "Re-activate User Account"}
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </PortalShell>
  );
}
