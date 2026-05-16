import { AccountDashboard } from "@/components/account-dashboard";
import { getEbookStats } from "@/lib/ebooks";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const stats = await getEbookStats();

  return <AccountDashboard stats={stats} />;
}
