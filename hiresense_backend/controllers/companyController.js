import {
  createEmployerCompany,
  getEmployerCompany,
  updateEmployerCompany
} from "../services/companyService.js";

export async function createCompany(
  req,
  res,
  next
) {
  try {
    const company =
      await createEmployerCompany({
        employerId: req.user.userId,
        name: req.body.name,
        description: req.body.description,
        website: req.body.website,
        location: req.body.location
      });

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: {
        company
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyCompany(
  req,
  res,
  next
) {
  try {
    const company =
      await getEmployerCompany(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message: "Company retrieved successfully",
      data: {
        company
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyCompany(
  req,
  res,
  next
) {
  try {
    const company =
      await updateEmployerCompany(
        req.user.userId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: {
        company
      }
    });
  } catch (error) {
    next(error);
  }
}