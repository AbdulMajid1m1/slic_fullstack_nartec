const companyLocation = require("../models/locationCompany");
const CustomError = require("../exceptions/customError");
const generateResponse = require("../utils/response");

exports.getAllLocationsCompanies = async (req, res, next) => {
  try {
    const locations = await companyLocation.findLocations();
    const companies = await companyLocation.findCompanies();

    if (locations.length <= 0 && companies.length <= 0) {
      const error = new CustomError(
        "Couldn't find any locations and companies"
      );
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(
      generateResponse(200, true, "Records retrieved successfully", {
        locations: locations,
        companies: companies,
      })
    );
  } catch (error) {
    console.error(error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};
