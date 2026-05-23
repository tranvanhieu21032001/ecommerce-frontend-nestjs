"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  DashboardTable,
  DashboardTableRow,
} from "@/components/dashboard/shared/dashboard-table";
import { DashboardStat } from "@/components/dashboard/shared/dashboard-stat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { SvgIcon } from "@/components/ui/svg-icon";
import { cn } from "@/lib/cn";
import { deleteUser, getUsers, type User } from "@/lib/api/users";

type RoleFilter = "all" | "admin" | "user";

const pageSize = 10;
const roleFilters: RoleFilter[] = ["all", "admin", "user"];
const tableColumns = "0.65fr 1.3fr 0.8fr 0.75fr 0.7fr 88px";

export function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();

    return users.filter((user) => {
      const fullName = getUserName(user).toLowerCase();
      const matchesSearch =
        !keyword ||
        user.email.toLowerCase().includes(keyword) ||
        fullName.includes(keyword) ||
        (user.phoneNumber ?? "").toLowerCase().includes(keyword);
      const matchesRole =
        roleFilter === "all" || user.role.toLowerCase() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [debouncedSearch, roleFilter, users]);

  const totalPages = Math.max(Math.ceil(filteredUsers.length / pageSize), 1);
  const visibleUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const adminCount = useMemo(
    () => users.filter((user) => user.role === "ADMIN").length,
    [users],
  );
  const customerCount = Math.max(users.length - adminCount, 0);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  async function loadUsers() {
    setIsLoading(true);

    try {
      const response = await getUsers();
      setUsers(response);
      setSelectedUser((current) => {
        if (!current) {
          return response[0] ?? null;
        }

        return response.find((user) => user.id === current.id) ?? null;
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load users.");
    } finally {
      setHasLoadedUsers(true);
      setIsLoading(false);
    }
  }

  async function handleDelete(user: User) {
    const confirmed = window.confirm(`Delete user "${user.email}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(user.id);

    try {
      await deleteUser(user.id);
      toast.success("User deleted successfully.");
      setUsers((current) => current.filter((item) => item.id !== user.id));
      setSelectedUser((current) => (current?.id === user.id ? null : current));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete user.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="min-w-0 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
              People
            </p>
            <h2 className="mt-1 text-[24px] font-black text-[color:var(--color-maintext)]">
              Users
            </h2>
            <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-[#6B7280]">
              Review customer accounts, admin access, and contact details.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DashboardStat label="Total" value={users.length} />
            <DashboardStat label="Admins" value={adminCount} />
            <DashboardStat label="Customers" value={customerCount} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
          <Input
            label="Search users"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or phone"
          />

          <RoleFilterTabs
            value={roleFilter}
            onChange={(role) => {
              setRoleFilter(role);
              setPage(1);
            }}
          />
        </div>

        <DashboardTable
          columns={tableColumns}
          headers={[
            "Role",
            "User",
            "Phone",
            "Birthday",
            "Joined",
            <span key="actions" className="text-right">
              Actions
            </span>,
          ]}
          hasData={visibleUsers.length > 0}
          isLoading={isLoading}
          showSkeleton={isLoading && !hasLoadedUsers}
          emptyState={
            <div className="flex min-h-[240px] flex-col items-center justify-center px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF7EF] text-[color:var(--color-primary)]">
                <SvgIcon src="/icons/customer.svg" size={22} />
              </div>
              <p className="mt-3 text-[15px] font-bold text-[color:var(--color-maintext)]">
                No users found
              </p>
              <p className="mt-1 text-[13px] text-[#7C8794]">
                Adjust search or role filters to see accounts.
              </p>
            </div>
          }
        >
          {visibleUsers.map((user) => (
            <DashboardTableRow key={user.id} columns={tableColumns}>
              <RoleBadge role={user.role} />
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedUser(user)}
                  className="block max-w-full truncate text-left font-bold text-[color:var(--color-maintext)] transition-colors hover:text-[color:var(--color-primary)] focus:outline-none focus-visible:text-[color:var(--color-primary)]"
                >
                  {getUserName(user)}
                </button>
                <p className="mt-1 truncate text-[12px] text-[#7C8794]">
                  {user.email}
                </p>
              </div>
              <span className="truncate text-[#6B7280]">
                {user.phoneNumber || "-"}
              </span>
              <span className="truncate text-[#6B7280]">
                {formatDate(user.birthday)}
              </span>
              <span className="truncate font-semibold text-[#1F2937]">
                {formatDate(user.createdAt)}
              </span>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(user)}
                  disabled={deletingId === user.id}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] text-[#E11D48] transition-colors hover:bg-[#FFF1F2] disabled:opacity-50"
                  aria-label={`Delete ${user.email}`}
                  title="Delete"
                >
                  <SvgIcon src="/icons/trash.svg" size={18} />
                </button>
              </div>
            </DashboardTableRow>
          ))}
        </DashboardTable>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[#7C8794]">
            Page {page} of {totalPages}
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            disabled={isLoading && !hasLoadedUsers}
            onPageChange={setPage}
          />
        </div>
      </section>

      <aside className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-subtext)]">
              Profile
            </p>
            <h3 className="mt-1 text-[20px] font-black text-[color:var(--color-maintext)]">
              {selectedUser ? getUserName(selectedUser) : "Select user"}
            </h3>
          </div>
          {selectedUser ? <RoleBadge role={selectedUser.role} /> : null}
        </div>

        {selectedUser ? (
          <div className="mt-5 grid gap-3">
            <ProfileField label="Email" value={selectedUser.email} />
            <ProfileField label="Phone" value={selectedUser.phoneNumber} />
            <ProfileField
              label="Birthday"
              value={formatDate(selectedUser.birthday)}
            />
            <ProfileField
              label="Joined"
              value={formatDate(selectedUser.createdAt)}
            />
            <ProfileField
              label="Updated"
              value={formatDate(selectedUser.updatedAt)}
            />

            <Button
              type="button"
              variant="danger"
              className="mt-2"
              disabled={deletingId === selectedUser.id}
              onClick={() => handleDelete(selectedUser)}
            >
              {deletingId === selectedUser.id ? "Deleting..." : "Delete user"}
            </Button>
          </div>
        ) : (
          <div className="mt-5 flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[color:var(--color-primary)] shadow-sm">
              <SvgIcon src="/icons/customer.svg" size={22} />
            </div>
            <p className="mt-3 text-[14px] font-bold text-[#1F2937]">
              No user selected
            </p>
            <p className="mt-1 text-[12px] text-[#7C8794]">
              Choose an account from the table to review details.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function RoleFilterTabs({
  value,
  onChange,
}: {
  value: RoleFilter;
  onChange: (value: RoleFilter) => void;
}) {
  return (
    <div className="flex items-center gap-1 pt-[29px]">
      {roleFilters.map((role) => (
        <button
          key={role}
          type="button"
          aria-pressed={value === role}
          onClick={() => onChange(role)}
          className={cn(
            "flex h-[44px] min-w-[78px] items-center justify-center rounded-lg px-4 text-[13px] font-semibold capitalize transition-colors",
            value === role
              ? "bg-[#F0FDF4] text-[color:var(--color-primary)]"
              : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#1F2937]",
          )}
        >
          {role}
        </button>
      ))}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "ADMIN";

  return (
    <span
      className={cn(
        "w-fit rounded-full px-3 py-1 text-[12px] font-bold",
        isAdmin ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#DCFCE7] text-[#166534]",
      )}
    >
      {isAdmin ? "Admin" : "User"}
    </span>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7C8794]">
        {label}
      </p>
      <p className="mt-1 truncate text-[14px] font-bold text-[#1F2937]">
        {value || "-"}
      </p>
    </div>
  );
}

function getUserName(user: User) {
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return name || user.email;
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
