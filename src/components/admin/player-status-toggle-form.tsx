"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { togglePlayerActiveDirectAction } from "@/server/actions/admin";

export function PlayerStatusToggleForm({
  playerId,
  active,
}: {
  playerId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      onClick={() =>
        startTransition(async () => {
          const formData = new FormData();
          formData.set("playerId", playerId);
          formData.set("active", active ? "false" : "true");

          const result = await togglePlayerActiveDirectAction(formData);

          if (result.success) {
            toast.success(result.message);
            router.refresh();
            return;
          }

          toast.error(result.message || "Nao foi possivel atualizar o status do jogador.");
        })
      }
      disabled={isPending}
      size="sm"
      variant={active ? "secondary" : "primary"}
      className="w-full sm:w-auto"
    >
      {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {active ? "Inativar" : "Reativar"}
    </Button>
  );
}
