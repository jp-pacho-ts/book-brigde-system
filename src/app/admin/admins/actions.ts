"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminRole } from "@prisma/client";
import { getAdminSession, hashPassword, isSuperAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getRole(formData: FormData) {
  return getFormString(formData, "role") === AdminRole.SUPER_ADMIN ? AdminRole.SUPER_ADMIN : AdminRole.ADMIN;
}

async function requireSuperAdmin() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  if (!isSuperAdmin(admin)) {
    redirect("/admin/dashboard");
  }

  return admin;
}

async function wouldRemoveLastSuperAdmin(adminId: string) {
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { role: true }
  });

  if (admin?.role !== "SUPER_ADMIN") {
    return false;
  }

  const superAdminCount = await prisma.adminUser.count({
    where: { role: "SUPER_ADMIN" }
  });

  return superAdminCount <= 1;
}

export async function saveAdminUserAction(formData: FormData) {
  await requireSuperAdmin();

  const adminId = getFormString(formData, "id");
  const name = getFormString(formData, "name");
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");
  const role = getRole(formData);

  if (!name || !email) {
    redirect(adminId ? `/admin/admins/${adminId}/edit?error=required` : "/admin/admins?error=required");
  }

  if (!adminId && password.length < 6) {
    redirect("/admin/admins?error=password");
  }

  if (adminId && role === AdminRole.ADMIN && (await wouldRemoveLastSuperAdmin(adminId))) {
    redirect(`/admin/admins/${adminId}/edit?error=last-super-admin`);
  }

  const data = {
    name,
    email,
    role,
    ...(password ? { passwordHash: hashPassword(password) } : {})
  };

  try {
    if (adminId) {
      await prisma.adminUser.update({
        where: { id: adminId },
        data
      });
    } else {
      await prisma.adminUser.create({
        data: {
          ...data,
          passwordHash: hashPassword(password)
        }
      });
    }
  } catch {
    redirect(adminId ? `/admin/admins/${adminId}/edit?error=email` : "/admin/admins?error=email");
  }

  revalidatePath("/admin/admins");
  revalidatePath("/admin/dashboard");
  redirect("/admin/admins");
}

export async function deleteAdminUserAction(formData: FormData) {
  const currentAdmin = await requireSuperAdmin();
  const adminId = getFormString(formData, "id");

  if (!adminId) {
    redirect("/admin/admins?error=missing");
  }

  if (adminId === currentAdmin.id) {
    redirect("/admin/admins?error=self-delete");
  }

  if (await wouldRemoveLastSuperAdmin(adminId)) {
    redirect("/admin/admins?error=last-super-admin");
  }

  await prisma.adminUser.delete({
    where: { id: adminId }
  });

  revalidatePath("/admin/admins");
  revalidatePath("/admin/dashboard");
  redirect("/admin/admins");
}
