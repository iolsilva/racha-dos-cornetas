import { monthlyFeeRules } from "@/lib/constants";

export function getMonthlyAmountHint() {
  return monthlyFeeRules
    .map((rule) => `${rule.label}: R$ ${rule.amount}`)
    .join(" | ");
}
