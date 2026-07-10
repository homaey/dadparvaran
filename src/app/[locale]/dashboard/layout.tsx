import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  const role = (session.user as any).role as "LAWYER" | "ADMIN";
  const name = session.user.name ?? "کاربر";

  return (
    <DashboardLayout role={role} userName={name}>
      {children}
    </DashboardLayout>
  );
}
