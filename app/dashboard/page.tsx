"use client";

import SummaryCard from "@/components/dashboard/SummaryCard";
import ChartsSection from "@/components/dashboard/ChartsSection";
import TransactionsTable from "@/components/dashboard/TransactionsTable";
import CarDetailsSection from "@/components/dashboard/CarDetailsSection";
import { useDashboardStats } from "@/hooks/queries/useStatistics";
import { PageContainer, StatsGrid } from "@/components/dashboard/layout";
import { LoadingState } from "@/components/dashboard/states";

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return <LoadingState type="page" />;
  }

  if (error) {
    console.error("Failed to load dashboard stats:", error);
  }

  return (
    <PageContainer>
      {/* Top Summary Cards */}
      <StatsGrid columns={4}>
        {/* <SummaryCard
          title="الربح الشهري"
          value={stats?.monthlyRevenue?.toLocaleString() ?? "0"}
          currency="EGP"
          iconSrc="/assets/dashboard/cards/money.svg"
        /> */}
        <SummaryCard
          title="طلب البيع اليوم"
          value={stats?.todaySalesRequests?.toString() ?? "0"}
          iconSrc="/assets/dashboard/cards/shop.svg"
        />
        <SummaryCard
          title="المفتشين النشطون"
          value={stats?.activeInspectors?.toString() ?? "0"}
          iconSrc="/assets/dashboard/cards/chart.svg"
        />
        <SummaryCard
          title="اجمالي المستخدمين"
          value={stats?.totalUsers?.toString() ?? "0"}
          iconSrc="/assets/dashboard/cards/profile.svg"
        />
      </StatsGrid>

      {/* Middle Charts Section */}
      <ChartsSection />

      {/* Car Details Section */}
      {/* <CarDetailsSection /> */}

      {/* Bottom Transactions Table */}
      <TransactionsTable />
    </PageContainer>
  );
}