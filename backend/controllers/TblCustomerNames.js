const axios = require("axios");

const Customer = require("../models/TblCustomerNames");
const CustomError = require("../exceptions/customError");
const generateResponse = require("../utils/response");

exports.getCustomerNames = async (req, res, next) => {
  try {
    const customers = await Customer.fetchAll();
    if (customers.length <= 0) {
      const error = new CustomError("Couldn't find any customers");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(200)
      .json(
        generateResponse(200, true, "Records retrieved successfully", customers)
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

exports.getSearch = async (req, res, next) => {
  const { query } = req.query;
  try {
    const customers = await Customer.searchByPartialNameOrCode(query);

    if (!customers || customers.length <= 0) {
      const error = CustomError("No customers found!");
      error.statusCode = 404;
      throw error;
    }

    res.json(
      generateResponse(200, true, "Successfully found customers", customers)
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

exports.sync = async (req, res, next) => {
  try {
    const authHeader = req.headers.Authorization || req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomError("Authorization header is missing or invalid", 401);
    }
    const token = authHeader.split(" ")[1];

    // Configuration for the external API request
    const externalApiUrl =
      "https://slicuat05api.oneerpcloud.com/oneerpreport/api/getapi";
    const requestBody = {
      filter: {
        P_TXN_TYPE: "CUSTOMER",
      },
      M_COMP_CODE: "SLIC",
      M_USER_ID: "SYSADMIN",
      APICODE: "ListOfCustomers",
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

    // Assuming the external API returns an array of customer names
    const externalCustomers = externalApiResponse.data;

    // Fetch all existing customers from your database
    const existingCustomers = await Customer.fetchAll();

    // Create a map of existing customers for easy lookup
    const existingCustomersMap = new Map(
      existingCustomers.map((customer) => [customer.CUST_CODE, customer])
    );

    // Array to store new or updated customers
    const customersToUpsert = [];

    // Iterate through external customers and check if they exist in your database
    for (const externalCustomer of externalCustomers) {
      if (
        !existingCustomersMap.has(externalCustomer.CUST_CODE) ||
        JSON.stringify(existingCustomersMap.get(externalCustomer.CUST_CODE)) !==
          JSON.stringify(externalCustomer)
      ) {
        customersToUpsert.push(externalCustomer);
      }
    }

    // Upsert the customers (create new or update existing)
    for (const customer of customersToUpsert) {
      await Customer.upsert(customer.CUST_CODE, customer);
    }

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          `Sync completed. ${customersToUpsert.length} customers added or updated.`,
          { upsertedCustomers: customersToUpsert }
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
