import env from "../../config/env.js";

const ADZUNA_BASE_URL =
  "https://api.adzuna.com/v1/api/jobs";

export async function fetchAdzunaJobs({
  country = "in",
  page = 1,
  resultsPerPage = 20,
  search,
  location
} = {}) {
  const params = new URLSearchParams();

  params.set(
    "app_id",
    env.adzuna.appId
  );

  params.set(
    "app_key",
    env.adzuna.appKey
  );

  params.set(
    "results_per_page",
    String(resultsPerPage)
  );

  if (search?.trim()) {
    params.set(
      "what",
      search.trim()
    );
  }

  if (location?.trim()) {
    params.set(
      "where",
      location.trim()
    );
  }

  const url =
    `${ADZUNA_BASE_URL}/${country}/search/${page}?${params.toString()}`;

  const response =
    await fetch(url);

  if (!response.ok) {
    const errorText =
      await response.text();

    const error = new Error(
      `Adzuna API request failed: ${response.status}`
    );

    error.statusCode =
      response.status;

    error.errorCode =
      "ADZUNA_API_ERROR";

    error.details =
      errorText;

    throw error;
  }

  const data =
    await response.json();

  return {
    count:
      Number(data.count || 0),

    jobs:
      Array.isArray(data.results)
        ? data.results
        : []
  };
}

export function normalizeAdzunaJob(job) {
  if (!job?.id) {
    throw new Error(
      "Adzuna job ID is missing"
    );
  }

  const description =
    cleanText(
      job.description || ""
    );

  const title =
    cleanText(
      job.title ||
        "Untitled Job"
    );

  const location =
    cleanText(
      job.location?.display_name ||
        ""
    ) || null;

  const employmentType =
    normalizeEmploymentType(
      job.contract_type,
      description
    );

  const experience =
    extractExperience(
      description,
      title
    );

  const salary =
    extractSalary(
      job,
      description
    );

  const roleLevel =
    normalizeRoleLevel(
      description,
      title,
      experience
    );

  const requiredSkills =
    extractSkills(
      job,
      description
    );

  return {
    source:
      "adzuna",

    externalJobId:
      String(job.id),

    title,

    description,

    company:
      cleanText(
        job.company?.display_name ||
          "Unknown Company"
      ),

    location,

    employmentType,

    experienceLevel:
      roleLevel,

    experienceMin:
      experience.min,

    experienceMax:
      experience.max,

    roleLevel,

    salaryMin:
      salary.min,

    salaryMax:
      salary.max,

    requiredSkills,

    externalUrl:
      job.redirect_url ||
      null,

    postedAt:
      job.created ||
      null
  };
}

export async function searchAdzunaJobs(
  options = {}
) {
  const result =
    await fetchAdzunaJobs(
      options
    );

  const jobs = [];

  for (
    const job of result.jobs
  ) {
    try {
      jobs.push(
        normalizeAdzunaJob(
          job
        )
      );
    } catch {
      continue;
    }
  }

  return {
    count:
      result.count,

    jobs
  };
}

function cleanText(value) {
  return String(value || "")
    .replace(
      /<[^>]*>/g,
      " "
    )
    .replace(
      /&nbsp;/gi,
      " "
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function normalizeEmploymentType(
  contractType,
  description
) {
  const value =
    String(
      contractType || ""
    )
      .trim()
      .toLowerCase();

  if (
    value === "full_time" ||
    value === "full-time" ||
    value === "full time"
  ) {
    return "full-time";
  }

  if (
    value === "part_time" ||
    value === "part-time" ||
    value === "part time"
  ) {
    return "part-time";
  }

  if (
    value === "contract"
  ) {
    return "contract";
  }

  if (
    value === "permanent"
  ) {
    return "full-time";
  }

  if (
    value === "temporary"
  ) {
    return "temporary";
  }

  const text =
    description.toLowerCase();

  if (
    /\bintern(ship)?\b/.test(
      text
    )
  ) {
    return "internship";
  }

  if (
    /\bfreelance\b/.test(
      text
    )
  ) {
    return "freelance";
  }

  if (
    /\btemporary\b|\btemp role\b/.test(
      text
    )
  ) {
    return "temporary";
  }

  if (
    /\bpart[- ]time\b/.test(
      text
    )
  ) {
    return "part-time";
  }

  if (
    /\bcontract\b|\bcontractor\b/.test(
      text
    )
  ) {
    return "contract";
  }

  if (
    /\bfull[- ]time\b|\bfull time\b/.test(
      text
    )
  ) {
    return "full-time";
  }

  return "not specified";
}

function extractExperience(
  description,
  title
) {
  const text =
    `${title} ${description}`
      .replace(
        /\s+/g,
        " "
      );

  let min = null;
  let max = null;

  const rangePatterns = [
    /(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i,

    /(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*(?:months?)/i,

    /(\d+(?:\.\d+)?)\s*(?:months?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*(?:years?)/i
  ];

  for (
    const pattern of rangePatterns
  ) {
    const match =
      text.match(pattern);

    if (!match) {
      continue;
    }

    const first =
      Number(match[1]);

    const second =
      Number(match[2]);

    const matchedText =
      match[0].toLowerCase();

    if (
      matchedText.includes(
        "month"
      )
    ) {
      min =
        first / 12;

      max =
        second / 12;
    } else {
      min = first;
      max = second;
    }

    break;
  }

  if (
    min === null ||
    max === null
  ) {
    const minimumPatterns = [
      /minimum\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i,

      /at\s+least\s+(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i,

      /(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience/i,

      /experience\s*[:\-]?\s*(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i
    ];

    for (
      const pattern of minimumPatterns
    ) {
      const match =
        text.match(pattern);

      if (!match) {
        continue;
      }

      min =
        Number(match[1]);

      max = null;

      break;
    }
  }

  if (
    min === null ||
    max === null
  ) {
    const monthsMatch =
      text.match(
        /(\d+(?:\.\d+)?)\s*(?:months?)\s+(?:of\s+)?experience/i
      );

    if (monthsMatch) {
      min =
        Number(
          monthsMatch[1]
        ) / 12;

      max = null;
    }
  }

  if (
    min === null &&
    max === null
  ) {
    const juniorPattern =
      /\b(?:entry[- ]level|fresher|graduate|junior|intern|internship)\b/i;

    const seniorPattern =
      /\b(?:senior|lead|principal|staff|manager|director|head)\b/i;

    if (
      juniorPattern.test(
        text
      )
    ) {
      min = 0;
      max = 2;
    } else if (
      seniorPattern.test(
        text
      )
    ) {
      min = 5;
      max = null;
    }
  }

  return {
    min:
      min === null
        ? null
        : roundExperience(min),

    max:
      max === null
        ? null
        : roundExperience(max)
  };
}

function roundExperience(
  value
) {
  return Number(
    Number(value).toFixed(1)
  );
}

function extractSalary(
  job,
  description
) {
  let min =
    job.salary_min != null
      ? Number(
          job.salary_min
        )
      : null;

  let max =
    job.salary_max != null
      ? Number(
          job.salary_max
        )
      : null;

  if (
    min !== null ||
    max !== null
  ) {
    return {
      min,
      max
    };
  }

  const text =
    description
      .replace(
        /,/g,
        ""
      )
      .replace(
        /₹/g,
        ""
      );

  const rangePatterns = [
    /(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*(lpa|lakhs?|k)?/i,

    /(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?)/i
  ];

  for (
    const pattern of rangePatterns
  ) {
    const match =
      text.match(pattern);

    if (!match) {
      continue;
    }

    const first =
      Number(match[1]);

    const second =
      Number(match[2]);

    const matchedText =
      match[0].toLowerCase();

    if (
      matchedText.includes(
        "lpa"
      ) ||
      matchedText.includes(
        "lakh"
      )
    ) {
      min =
        first * 100000;

      max =
        second * 100000;
    } else if (
      matchedText.includes(
        "k"
      )
    ) {
      min =
        first * 1000;

      max =
        second * 1000;
    } else {
      min = first;
      max = second;
    }

    return {
      min,
      max
    };
  }

  const minimumSalary =
    text.match(
      /(?:salary|pay|package)[^0-9]{0,30}(\d+(?:\.\d+)?)\s*(lpa|lakhs?|k)?/i
    );

  if (minimumSalary) {
    let value =
      Number(
        minimumSalary[1]
      );

    const unit =
      String(
        minimumSalary[2] ||
          ""
      ).toLowerCase();

    if (
      unit === "lpa" ||
      unit.includes("lakh")
    ) {
      value *= 100000;
    } else if (
      unit === "k"
    ) {
      value *= 1000;
    }

    return {
      min: value,
      max: null
    };
  }

  return {
    min: null,
    max: null
  };
}

function normalizeRoleLevel(
  description,
  title,
  experience
) {
  const text =
    `${title} ${description}`
      .toLowerCase();

  if (
    /\b(intern|internship|trainee)\b/
      .test(text)
  ) {
    return "internship";
  }

  if (
    /\b(entry[- ]level|fresher|graduate)\b/
      .test(text)
  ) {
    return "entry-level";
  }

  if (
    /\b(junior|jr\.?)\b/
      .test(text)
  ) {
    return "junior";
  }

  if (
    /\b(mid[- ]level|mid level)\b/
      .test(text)
  ) {
    return "mid-level";
  }

  if (
    /\b(senior|sr\.?)\b/
      .test(text)
  ) {
    return "senior";
  }

  if (
    /\b(lead|principal|staff)\b/
      .test(text)
  ) {
    return "lead";
  }

  if (
    /\b(manager|director|head)\b/
      .test(text)
  ) {
    return "manager";
  }

  if (
    experience.min !== null
  ) {
    if (
      experience.min >= 7
    ) {
      return "lead";
    }

    if (
      experience.min >= 5
    ) {
      return "senior";
    }

    if (
      experience.min >= 3
    ) {
      return "mid-level";
    }

    if (
      experience.min >= 1
    ) {
      return "junior";
    }

    return "entry-level";
  }

  return "not specified";
}

function extractSkills(
  job,
  description
) {
  const skills = [];

  if (
    Array.isArray(
      job.skills
    )
  ) {
    skills.push(
      ...job.skills
        .map((skill) =>
          typeof skill ===
          "string"
            ? skill
            : skill?.name
        )
        .filter(Boolean)
    );
  }

  const skillPatterns = [
    /\bJavaScript\b/gi,
    /\bTypeScript\b/gi,
    /\bReact(?:\.js)?\b/gi,
    /\bNode\.?js\b/gi,
    /\bExpress(?:\.js)?\b/gi,
    /\bPython\b/gi,
    /\bJava\b/gi,
    /\bC\+\+\b/g,
    /\bC#\b/g,
    /\bSQL\b/gi,
    /\bMySQL\b/gi,
    /\bPostgreSQL\b/gi,
    /\bMongoDB\b/gi,
    /\bAWS\b/g,
    /\bAzure\b/gi,
    /\bDocker\b/gi,
    /\bKubernetes\b/gi,
    /\bGit\b/gi,
    /\bREST API\b/gi,
    /\bGraphQL\b/gi,
    /\bMachine Learning\b/gi,
    /\bArtificial Intelligence\b/gi,
    /\bData Science\b/gi,
    /\bSAP\b/gi,
    /\bSalesforce\b/gi
  ];

  for (
    const pattern of skillPatterns
  ) {
    const matches =
      description.match(
        pattern
      );

    if (matches) {
      skills.push(
        ...matches
      );
    }
  }

  return [
    ...new Map(
      skills.map(
        (skill) => [
          skill
            .trim()
            .toLowerCase(),
          skill.trim()
        ]
      )
    ).values()
  ].slice(0, 30);
}