export function calculateExperienceScore({
  candidateExperienceYears,
  experienceMin,
  experienceMax
}) {
  const experience =
    Number(candidateExperienceYears ?? 0);

  const minimum =
    Number(experienceMin ?? 0);

  const maximum =
    Number(experienceMax ?? minimum);

  if (
    !Number.isFinite(experience) ||
    !Number.isFinite(minimum) ||
    !Number.isFinite(maximum)
  ) {
    return 0;
  }

  if (experience < 0) {
    return 0;
  }

  if (experience < minimum) {
    if (minimum === 0) {
      return 100;
    }

    return Number(
      Math.max(
        0,
        Math.min(
          100,
          (experience / minimum) * 100
        )
      ).toFixed(2)
    );
  }

  if (
    maximum > minimum &&
    experience > maximum
  ) {
    return 100;
  }

  return 100;
}

export function calculateRecencyScore({
  workHistory
}) {
  if (
    !Array.isArray(workHistory) ||
    workHistory.length === 0
  ) {
    return 0;
  }

  const dates =
    workHistory
      .map((work) =>
        parseDate(work.endDate)
      )
      .filter(Boolean);

  if (dates.length === 0) {
    return 0;
  }

  const latestDate =
    new Date(
      Math.max(
        ...dates.map((date) =>
          date.getTime()
        )
      )
    );

  const now = new Date();

  const daysSinceLatest =
    Math.max(
      0,
      (now.getTime() -
        latestDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

  if (daysSinceLatest <= 180) {
    return 100;
  }

  if (daysSinceLatest <= 365) {
    return 80;
  }

  if (daysSinceLatest <= 730) {
    return 60;
  }

  if (daysSinceLatest <= 1095) {
    return 40;
  }

  return 20;
}

export function calculateFinalScore({
  matchScore,
  experienceScore,
  recencyScore
}) {
  const finalScore =
    Number(matchScore ?? 0) * 0.7 +
    Number(experienceScore ?? 0) * 0.2 +
    Number(recencyScore ?? 0) * 0.1;

  return Number(
    finalScore.toFixed(2)
  );
}

export function rankCandidates(
  candidates
) {
  return candidates
    .map((candidate) => {
      const experienceScore =
        calculateExperienceScore({
          candidateExperienceYears:
            candidate.resume
              ?.experienceYears ?? 0,

          experienceMin:
            candidate.job
              ?.experienceMin ?? 0,

          experienceMax:
            candidate.job
              ?.experienceMax ?? 0
        });

      const recencyScore =
        calculateRecencyScore({
          workHistory:
            candidate.resume
              ?.workHistory ?? []
        });

      const finalScore =
        calculateFinalScore({
          matchScore:
            candidate.match
              ?.matchScore ?? 0,

          experienceScore,

          recencyScore
        });

      return {
        ...candidate,
        ranking: {
          matchScore:
            Number(
              candidate.match
                ?.matchScore ?? 0
            ),
          experienceScore,
          recencyScore,
          finalScore
        }
      };
    })
    .sort(
      (a, b) =>
        b.ranking.finalScore -
        a.ranking.finalScore
    );
}

function parseDate(value) {
  if (
    !value ||
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim().toLowerCase();

  if (
    normalized === "present" ||
    normalized === "current" ||
    normalized === "ongoing"
  ) {
    return new Date();
  }

  const parsed =
    new Date(value);

  if (
    !Number.isNaN(
      parsed.getTime()
    )
  ) {
    return parsed;
  }

  const monthYear =
    value.match(
      /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})$/i
    );

  if (monthYear) {
    return new Date(
      `${monthYear[1]} 1, ${monthYear[2]}`
    );
  }

  const year =
    value.match(
      /\b(19|20)\d{2}\b/
    );

  if (year) {
    return new Date(
      `January 1, ${year[0]}`
    );
  }

  return null;
}