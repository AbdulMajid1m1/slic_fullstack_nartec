const https = require("https");
const { CustomError } = require("../exceptions/customError");

exports.slicLogin = async (req, res, next) => {
  const url = "https://slicuat05api.oneerpcloud.com/oneerpauth/api/login";
  const { apiKey } = req.body;

  const data = JSON.stringify({
    apiKey: apiKey,
  });

  const headers = {
    "Content-Type": "application/json",
    "X-tenanttype": "live",
  };

  const urlObject = new URL(url);

  const options = {
    hostname: urlObject.hostname,
    path: urlObject.pathname,
    method: "POST",
    headers: {
      ...headers,
      "Content-Length": data.length,
    },
  };

  try {
    const request = https.request(options, (response) => {
      let responseData = "";

      response.on("data", (chunk) => {
        responseData += chunk;
      });

      response.on("end", () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          res.status(200).json(JSON.parse(responseData));
        } else {
          next(new Error(`HTTP error! status: ${response.statusCode}`));
        }
      });
    });

    request.on("error", (error) => {
      console.error("Error verifying email:", error);
      if (error instanceof CustomError) {
        return next(error);
      }
      error.message = null;
      next(error);
    });

    request.write(data);
    request.end();
  } catch (error) {
    console.error("Unexpected error:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};
