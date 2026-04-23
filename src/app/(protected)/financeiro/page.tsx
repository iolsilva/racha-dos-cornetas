import { PiggyBank, ReceiptText, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Table, Td, Th } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { getFinancePageData } from "@/lib/data/dashboard";
import { formatPaymentTypeLabel } from "@/lib/labels";

type MonthlySummaryRow = {
  reference_month: string;
  total_payments: number;
  total_expenses: number;
  prize_reserve: number;
  balance: number;
};

export default async function FinanceiroPage() {
  const { monthlySummary, myPayments } = await getFinancePageData();
  const latest = monthlySummary[0];

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Financeiro"
        title="Extrato consolidado"
        description="Saldo do caixa, arrecadacao por competencia e seu historico de pagamentos."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          icon={Wallet}
          title="Saldo atual"
          value={formatCurrency(latest?.balance)}
          subtitle="Considera receitas, despesas e reserva"
        />
        <StatsCard
          icon={ReceiptText}
          title="Arrecadacao do mes"
          value={formatCurrency(latest?.total_payments)}
          subtitle="Mensalistas, diaristas e ajustes"
        />
        <StatsCard
          icon={PiggyBank}
          title="Reserva premiacao"
          value={formatCurrency(latest?.prize_reserve)}
          subtitle="Separada do caixa operacional"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Resumo mensal
          </p>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Referencia</Th>
                  <Th>Receitas</Th>
                  <Th>Despesas</Th>
                  <Th>Reserva</Th>
                  <Th>Saldo</Th>
                </tr>
              </thead>
              <tbody>
                {(monthlySummary as MonthlySummaryRow[]).map((month) => (
                  <tr key={month.reference_month}>
                    <Td>{formatDate(month.reference_month)}</Td>
                    <Td>{formatCurrency(month.total_payments)}</Td>
                    <Td>{formatCurrency(month.total_expenses)}</Td>
                    <Td>{formatCurrency(month.prize_reserve)}</Td>
                    <Td>{formatCurrency(month.balance)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Meus pagamentos
          </p>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Data</Th>
                  <Th>Tipo</Th>
                  <Th>Valor</Th>
                </tr>
              </thead>
              <tbody>
                {myPayments.map((payment) => (
                  <tr key={payment.id}>
                    <Td>{formatDate(payment.paid_at)}</Td>
                    <Td>{formatPaymentTypeLabel(payment.payment_type)}</Td>
                    <Td>{formatCurrency(payment.amount)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
