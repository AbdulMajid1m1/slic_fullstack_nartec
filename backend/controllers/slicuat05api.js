const fetch = require("node-fetch");

exports.slicLogin = async (req, res, next) => {
  const url = "http://slicuat05api.oneerpcloud.com/oneerpauth/api/login";
  const { apiKey } = req.body;

  const data = {
    apiKey: apiKey,
  };

  const headers = {
    "Content-Type": "application/json",
    "X-tenanttype": "live",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error verifying email:", error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};
