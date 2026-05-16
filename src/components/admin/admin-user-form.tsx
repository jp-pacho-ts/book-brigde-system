import type { AdminUser } from "@prisma/client";
import { saveAdminUserAction } from "@/app/admin/admins/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminUserFormProps = {
  adminUser?: Pick<AdminUser, "id" | "name" | "email" | "role">;
  error?: string;
};

const errorMessages: Record<string, string> = {
  required: "Name and email are required.",
  password: "New admin passwords must be at least 6 characters.",
  email: "That admin email is already in use.",
  "last-super-admin": "At least one superadmin must remain."
};

export function AdminUserForm({ adminUser, error }: AdminUserFormProps) {
  const isEditing = Boolean(adminUser);

  return (
    <Card className="shadow-soft">
      <CardHeader className="border-b">
        <h2 className="text-2xl font-semibold text-foreground">
          {isEditing ? "Edit admin account" : "Create admin account"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Superadmins can manage admin accounts. Admins can manage ebook records.
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <form action={saveAdminUserAction} className="space-y-4">
          <input type="hidden" name="id" value={adminUser?.id ?? ""} />

          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={adminUser?.name ?? ""} className="mt-2 h-11" required />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={adminUser?.email ?? ""}
              className="mt-2 h-11"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">{isEditing ? "New password" : "Password"}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={isEditing ? undefined : 6}
              placeholder={isEditing ? "Leave blank to keep current password" : "At least 6 characters"}
              className="mt-2 h-11"
              required={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              defaultValue={adminUser?.role ?? "ADMIN"}
              className="mt-2 flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Superadmin</option>
            </select>
          </div>

          {error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {errorMessages[error] ?? "Unable to save this admin account."}
            </p>
          ) : null}

          <Button type="submit" className="h-11 w-full">
            {isEditing ? "Save admin account" : "Create admin account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
