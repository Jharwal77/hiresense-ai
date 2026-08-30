import {
  createCompany,
  findCompanyByEmployerId,
  updateCompanyByEmployerId
} from "../models/mysql/companyModel.js";

export async function createEmployerCompany({
  employerId,
  name,
  description,
  website,
  location
}) {
  const existingCompany =
    await findCompanyByEmployerId(employerId);

  if (existingCompany) {
    const error = new Error(
      "Company profile already exists"
    );

    error.statusCode = 409;
    error.errorCode = "COMPANY_ALREADY_EXISTS";

    throw error;
  }

  return createCompany({
    employerId,
    name,
    description,
    website,
    location
  });
}

export async function getEmployerCompany(
  employerId
) {
  const company =
    await findCompanyByEmployerId(employerId);

  if (!company) {
    const error = new Error(
      "Company profile not found"
    );

    error.statusCode = 404;
    error.errorCode = "COMPANY_NOT_FOUND";

    throw error;
  }

  return company;
}

export async function updateEmployerCompany(
  employerId,
  updates
) {
  const existingCompany =
    await findCompanyByEmployerId(employerId);

  if (!existingCompany) {
    const error = new Error(
      "Company profile not found"
    );

    error.statusCode = 404;
    error.errorCode = "COMPANY_NOT_FOUND";

    throw error;
  }

  const name =
    updates.name ?? existingCompany.name;

  const description =
    updates.description ??
    existingCompany.description;

  const website =
    updates.website ??
    existingCompany.website;

  const location =
    updates.location ??
    existingCompany.location;

  return updateCompanyByEmployerId(
    employerId,
    {
      name,
      description,
      website,
      location
    }
  );
}