import { AccountDashboard } from "@/components/account-dashboard";
import { getEbookStats } from "@/lib/ebooks";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  let stats = { total: 0, premium: 0, free: 0 };

  try {
    stats = await getEbookStats();
  } catch (error) {
    console.error("Unable to load ebook stats for account dashboard.", error);
  }

  return <AccountDashboard stats={stats} />;
}
