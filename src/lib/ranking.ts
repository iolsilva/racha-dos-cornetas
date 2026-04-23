type RankingComparable = {
  wins: number;
  draws: number;
  matches_played: number;
  nickname: string;
};

function compareText(left: string, right: string) {
  return left.localeCompare(right, "pt-BR", { sensitivity: "base" });
}

export function compareRankingEntries<T extends RankingComparable>(left: T, right: T) {
  if (left.wins !== right.wins) {
    return right.wins - left.wins;
  }

  if (left.draws !== right.draws) {
    return right.draws - left.draws;
  }

  if (left.matches_played !== right.matches_played) {
    return right.matches_played - left.matches_played;
  }

  return compareText(left.nickname, right.nickname);
}

export function withCompetitionPositions<T extends RankingComparable>(
  entries: T[],
): Array<T & { rank_position: number }> {
  let currentPosition = 0;
  let previousEntry: RankingComparable | null = null;

  return entries.map((entry, index) => {
    const isTied =
      previousEntry &&
      previousEntry.wins === entry.wins &&
      previousEntry.draws === entry.draws &&
      previousEntry.matches_played === entry.matches_played;

    if (!isTied) {
      currentPosition = index + 1;
      previousEntry = entry;
    }

    return {
      ...entry,
      rank_position: currentPosition,
    };
  });
}

export function countEntriesByRank<T extends { rank_position: number }>(entries: T[]) {
  return entries.reduce<Record<number, number>>((accumulator, entry) => {
    accumulator[entry.rank_position] = (accumulator[entry.rank_position] ?? 0) + 1;
    return accumulator;
  }, {});
}
