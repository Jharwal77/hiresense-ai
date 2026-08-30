import {
  aggregateAdzunaJobs
} from "./services/jobAggregationService.js";

try {
  const result =
    await aggregateAdzunaJobs({
      country: "in",
      page: 1,
      resultsPerPage: 5,
      search: "software developer"
    });

  console.log(
    "Source:",
    result.source
  );

  console.log(
    "Total available:",
    result.total
  );

  console.log(
    "Imported:",
    result.imported
  );

  console.dir(
    result.jobs,
    {
      depth: null
    }
  );
} catch (error) {
  console.error(
    "Job aggregation failed:",
    error.message
  );
}