const axios = require("axios");

const CustomError = require("../exceptions/customError");

exports.slicLogin = async (req, res, next) => {
  const url = "http://slicuat05api.oneerpcloud.com/oneerpauth/api/login";
  const apiKey =
    "b4d21674cd474705f6caa07d618b389ddc7ebc25a77a0dc591f49e9176beda01";

  const data = {
    apiKey: apiKey,
  };

  const headers = {
    "X-tenanttype": "live",
  };

  try {
    const response = await axios.post(url, data, { headers: headers });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error verifying email:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};
