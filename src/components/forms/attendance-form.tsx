"use client";

import { useServerAction } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { updateAttendanceAction } from "@/server/actions/admin";

export function AttendanceForm({
  matchId,
  playerId,
  confirmed,
}: {
  matchId: string;
  playerId: string;
  confirmed: boolean;
}) {
  const { formAction } = useServerAction(updateAttendanceAction);

  return (
    <div className="flex gap-2">
      <form action={formAction}>
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="playerId" value={playerId} />
        <input type="hidden" name="status" value="confirmed" />
        <SubmitButton variant={confirmed ? "secondary" : "primary"}>
          {confirmed ? "Confirmado" : "Confirmar presenca"}
        </SubmitButton>
      </form>
      <form action={formAction}>
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="playerId" value={playerId} />
        <input type="hidden" name="status" value="declined" />
        <Button variant="ghost" type="submit">
          Nao vou
        </Button>
      </form>
    </div>
  );
}
