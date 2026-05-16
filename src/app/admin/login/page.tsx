import { redirect } from "next/navigation";
import { BookOpenCheck, ShieldCheck } from "lucide-react";
import { loginAdminAction } from "@/app/admin/actions";
import { getAdminSession } from "@/lib/admin-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [admin, params] = await Promise.all([getAdminSession(), searchParams]);

  if (admin) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="surface-line flex items-center">
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-14">
        <div>
          <Badge variant="secondary" className="gap-2 rounded-full px-3 py-1">
            <ShieldCheck size={14} aria-hidden="true" />
            Admin access
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Manage the BookBridge catalog.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Sign in with the separate admin account to add ebooks, edit metadata, attach cover
            images, and control free or premium access.
          </p>
        </div>

        <Card className="shadow-soft">
          <CardHeader className="flex-row items-center justify-between border-b">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Admin sign in</h2>
              <p className="text-sm text-muted-foreground">Enter administrator credentials</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
              <BookOpenCheck size={24} aria-hidden="true" />
            </span>
          </CardHeader>

          <CardContent className="pt-6">
            <form action={loginAdminAction} className="space-y-4">
              <div>
                <Label htmlFor="email">Admin email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@bookbridge.test"
                  className="mt-2 h-11"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  className="mt-2 h-11"
                  required
                />
              </div>

              {params.error ? (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  Invalid admin email or password.
                </p>
              ) : null}

              <Button type="submit" className="h-11 w-full">
                Sign in to dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
