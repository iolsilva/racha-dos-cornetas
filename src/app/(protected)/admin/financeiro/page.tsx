import { ExpenseForm } from "@/components/forms/expense-form";
import { PaymentForm } from "@/components/forms/payment-form";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, Td, Th } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { getMonthlyAmountHint } from "@/lib/finance";
import {
  formatExpenseCategoryLabel,
  formatPaymentTypeLabel,
} from "@/lib/labels";
import { getAdminFinanceData } from "@/lib/data/admin";
import { requireAdmin } from "@/lib/auth";

export default async function AdminFinanceiroPage() {
  await requireAdmin();
  const data = await getAdminFinanceData();

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Admin / Financeiro"
        title="Receitas, despesas e caixa"
        description="Mensalistas e diaristas ficam separados para deixar o lancamento financeiro mais rapido."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-slate-500">
            Mensalistas
          </p>
          <PaymentForm
            players={data.monthlyPlayers}
            paymentType="monthly_fee"
            title="Registrar mensalidade"
            submitLabel="Salvar mensalidade"
            amountDefaultValue={50}
            amountHint={getMonthlyAmountHint()}
          />
        </Card>
        <Card>
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-slate-500">
            Diaristas
          </p>
          <PaymentForm
            players={data.guestPlayers}
            paymentType="guest_fee"
            title="Registrar diarista"
            submitLabel="Salvar diarista"
            amountDefaultValue={15}
            amountHint="Cadastro separado dos mensalistas. Valor padrao por jogo: R$ 15."
          />
        </Card>
        <Card>
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-slate-500">
            Registrar despesa
          </p>
          <ExpenseForm />
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Ultimos pagamentos
          </p>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Data</Th>
                  <Th>Jogador</Th>
                  <Th>Tipo</Th>
                  <Th>Referencia</Th>
                  <Th>Valor</Th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((payment) => (
                  <tr key={payment.id}>
                    <Td>{formatDate(payment.paid_at)}</Td>
                    <Td>
                      {(payment.players as { nickname?: string; full_name?: string } | null)
                        ?.nickname ??
                        (payment.players as { full_name?: string } | null)?.full_name ??
                        "-"}
                    </Td>
                    <Td>{formatPaymentTypeLabel(payment.payment_type)}</Td>
                    <Td>{formatDate(payment.reference_month)}</Td>
                    <Td>{formatCurrency(payment.amount)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Ultimas despesas
          </p>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Data</Th>
                  <Th>Categoria</Th>
                  <Th>Descricao</Th>
                  <Th>Valor</Th>
                </tr>
              </thead>
              <tbody>
                {data.expenses.map((expense) => (
                  <tr key={expense.id}>
                    <Td>{formatDate(expense.expense_date)}</Td>
                    <Td>{formatExpenseCategoryLabel(expense.category)}</Td>
                    <Td>{expense.description}</Td>
                    <Td>{formatCurrency(expense.amount)}</Td>
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
