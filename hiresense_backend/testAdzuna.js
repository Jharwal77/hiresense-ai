import {
  searchAdzunaJobs
} from "./services/jobSources/adzunaService.js";

try {
  const result =
    await searchAdzunaJobs({
      country: "in",
      page: 1,
      resultsPerPage: 5,
      search: "software developer"
    });

  console.log(
    "Total jobs:",
    result.count
  );

  console.dir(
    result.jobs,
    {
      depth: null
    }
  );
} catch (error) {
  console.error(
    "Adzuna test failed:",
    error.message
  );
}