import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Informe um e-mail valido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
});

export const playerSchema = z
  .object({
    fullName: z.string().min(3, "Informe o nome completo."),
    nickname: z.string().min(2, "Informe o apelido."),
    playerType: z.enum(["fixed", "guest", "goalkeeper"]),
    position: z.enum(["line", "goalkeeper"]),
    phone: z.string().optional(),
    active: z.boolean().default(true),
    feeExempt: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.playerType === "goalkeeper" && data.position !== "goalkeeper") {
      ctx.addIssue({
        code: "custom",
        path: ["position"],
        message: "Goleiro precisa ficar com posicao de goleiro.",
      });
    }

    if (data.playerType === "fixed" && data.position !== "line") {
      ctx.addIssue({
        code: "custom",
        path: ["position"],
        message: "Mensalista fixo entra como jogador de linha.",
      });
    }
  });

export const playerStatusSchema = z.object({
  playerId: z.uuid("Jogador invalido."),
  active: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export const paymentSchema = z.object({
  playerId: z.uuid("Jogador invalido."),
  referenceMonth: z.string().min(10),
  amount: z.coerce.number().min(0),
  paymentType: z.enum(["monthly_fee", "guest_fee", "adjustment"]),
  paidAt: z.string().min(10),
  notes: z.string().optional(),
});

export const expenseSchema = z.object({
  referenceMonth: z.string().min(10),
  amount: z.coerce.number().positive("Valor deve ser maior que zero."),
  category: z.enum([
    "field_rent",
    "barbecue",
    "equipment",
    "awards",
    "other",
  ]),
  expenseDate: z.string().min(10),
  description: z.string().min(3, "Descreva a despesa."),
  reserveForAwards: z.boolean().default(false),
});

export const matchSchema = z.object({
  matchDate: z.string().min(10),
  startTime: z.string().optional(),
  location: z.string().min(3, "Informe o local."),
  notes: z.string().optional(),
});

const nullableScoreSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    return Number(value);
  },
  z.number().int().min(0).nullable(),
);

export const matchAssignmentSchema = z.object({
  playerId: z.uuid("Jogador invalido."),
  teamColor: z.enum(["blue", "red"]),
  isGoalkeeper: z.boolean().default(false),
  isReserve: z.boolean().default(false),
  lineupOrder: z.number().int().positive().nullable().optional(),
});

export const updateMatchSchema = z
  .object({
    matchId: z.uuid("Partida invalida."),
    matchDate: z.string().min(10, "Informe a data da partida."),
    startTime: z.string().optional(),
    location: z.string().min(3, "Informe o local."),
    notes: z.string().optional(),
    status: z.enum(["scheduled", "completed", "cancelled"]),
    countsForRanking: z.boolean().default(true),
    blueScore: nullableScoreSchema,
    redScore: nullableScoreSchema,
    assignments: z.array(matchAssignmentSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.status === "completed") {
      if (data.blueScore === null || data.redScore === null) {
        ctx.addIssue({
          code: "custom",
          path: ["blueScore"],
          message: "Informe o placar completo para concluir a partida.",
        });
      }

      if (data.assignments.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["assignments"],
          message: "Inclua os participantes para recalcular o ranking com consistencia.",
        });
      }
    }

    const playerIds = data.assignments.map((assignment) => assignment.playerId);
    const uniqueIds = new Set(playerIds);

    if (uniqueIds.size !== playerIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["assignments"],
        message: "Um jogador nao pode aparecer duas vezes na mesma partida.",
      });
    }
  });

export const teamBuilderSchema = z
  .object({
    matchId: z.uuid("Partida invalida."),
    presentPlayerIds: z.array(z.uuid("Jogador invalido.")).default([]),
    assignments: z.array(matchAssignmentSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const uniquePresentIds = new Set(data.presentPlayerIds);

    if (uniquePresentIds.size !== data.presentPlayerIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["presentPlayerIds"],
        message: "A lista de presenca contem jogadores repetidos.",
      });
    }

    const assignmentPlayerIds = data.assignments.map((assignment) => assignment.playerId);
    const uniqueAssignmentIds = new Set(assignmentPlayerIds);

    if (uniqueAssignmentIds.size !== assignmentPlayerIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["assignments"],
        message: "Um jogador nao pode aparecer duas vezes na mesma montagem.",
      });
    }

    const missingPlayers = data.assignments.filter(
      (assignment) => !uniquePresentIds.has(assignment.playerId),
    );

    if (missingPlayers.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["assignments"],
        message: "Todo jogador alocado precisa estar confirmado na presenca.",
      });
    }
  });

export const resultSchema = z.object({
  matchId: z.uuid("Selecione a partida que voce quer atualizar."),
  blueScore: z.coerce.number().min(0, "O placar do azul nao pode ser negativo."),
  redScore: z.coerce.number().min(0, "O placar do vermelho nao pode ser negativo."),
});

export const attendanceSchema = z.object({
  matchId: z.uuid(),
  playerId: z.uuid(),
  status: z.enum(["confirmed", "declined"]),
});
