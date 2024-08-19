const axios = require("axios");

const TrxCodesType = require("../models/TrxCodesType");
const CustomError = require("../exceptions/customError");
const response = require("../utils/response");

exports.getAll = async (req, res, next) => {
  try {
    const trxCodes = await TrxCodesType.fetchAll();
    if (!trxCodes || trxCodes.length === 0) {
      const error = new CustomError("No transaction codes found!");
      error.statusCode = 404;
      throw error;
    }

    res
      .status(200)
      .json(
        response(
          200,
          true,
          "Transaction codes retrieved successfully",
          trxCodes
        )
      );
  } catch (error) {
    console.error(error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = "Server error occurred";
    next(error);
  }
};

exports.sync = async (req, res, next) => {
  try {
    // Extract Bearer token from the Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomError("Authorization header is missing or invalid", 401);
    }
    const token = authHeader.split(" ")[1];

    // Configuration for the external API request
    const externalApiUrl =
      "https://slicuat05api.oneerpcloud.com/oneerpreport/api/getapi";
    const requestBody = {
      filter: {
        P_TXN_TYPE: "LTRFO",
      },
      M_COMP_CODE: "SLIC",
      M_USER_ID: "SYSADMIN",
      APICODE: "ListOfTransactionCode",
      M_LANG_CODE: "ENG",
    };
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Make the request to the external API
    const externalApiResponse = await axios.post(externalApiUrl, requestBody, {
      headers,
    });

    if (!externalApiResponse.data || !Array.isArray(externalApiResponse.data)) {
      throw new CustomError("Invalid response from external API", 500);
    }

    // Assuming the external API returns an array of transaction codes
    const externalTrxCodes = externalApiResponse.data;

    // Fetch all existing transaction codes from your database
    const existingTrxCodes = await TrxCodesType.fetchAll();

    // Create a map of existing codes for easy lookup
    const existingCodesMap = new Map(
      existingTrxCodes.map((code) => [code.code, code])
    );

    // Array to store new codes that need to be added
    const newCodes = [];

    // Iterate through external codes and check if they exist in your database
    for (const externalCode of externalTrxCodes) {
      if (!existingCodesMap.has(externalCode.code)) {
        newCodes.push(externalCode);
      }
    }

    // If there are new codes, add them to your database
    if (newCodes.length > 0) {
      await TrxCodesType.bulkCreate(newCodes);
    }

    res
      .status(200)
      .json(
        response(
          200,
          true,
          `Sync completed. ${newCodes.length} new codes added.`,
          { addedCodes: newCodes }
        )
      );
  } catch (error) {
    console.error(error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = "Server error occurred during sync";
    next(error);
  }
};
