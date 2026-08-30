import {
  upsertExternalJob
} from "../models/mysql/jobModel.js";

import {
  searchAdzunaJobs
} from "./jobSources/adzunaService.js";

export async function aggregateAdzunaJobs({
  country = "in",
  page = 1,
  resultsPerPage = 20,
  search,
  location
} = {}) {
  const result =
    await searchAdzunaJobs({
      country,
      page,
      resultsPerPage,
      search,
      location
    });

  const savedJobs = [];

  for (const job of result.jobs) {
    try {
      const saved =
        await upsertExternalJob(job);

      savedJobs.push({
        ...job,
        id: saved.jobId,
        syncAction: saved.action
      });
    } catch (error) {
      console.error(
        `Failed to save Adzuna job ${job.externalJobId}:`,
        error.message
      );
    }
  }

  return {
    source: "adzuna",
    total: result.count,
    imported: savedJobs.length,
    jobs: savedJobs
  };
}