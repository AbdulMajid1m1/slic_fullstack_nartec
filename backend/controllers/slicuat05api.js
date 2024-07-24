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

exports.slicGetApi = async (req, res, next) => {
  const url = "https://slicuat05api.oneerpcloud.com/oneerpreport/api/getapi";
  const { authorization } = req.headers;
  const requestBody = req.body;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token is missing or invalid" });
  }

  const token = authorization.split(" ")[1];

  const data = JSON.stringify(requestBody);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
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
          return next(new Error(`HTTP error! status: ${response.statusCode}`));
        }
      });
    });

    request.on("error", (error) => {
      console.error("Error calling API:", error);
      if (error instanceof CustomError) {
        return next(error);
      }
      error.message = null;
      return next(error);
    });

    request.write(data);
    request.end();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.slicPostData = async (req, res, next) => {
  const url = "https://slicuat05api.oneerpcloud.com/oneerpreport/api/postdata";
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token is missing or invalid" });
  }

  const token = authorization.split(" ")[1];

  //   {
  //     _keyword_: "Invoice",
  //     "_secret-key_": "2bf52be7-9f68-4d52-9523-53f7f267153b",
  //     data: [
  //       {
  //         Company: "SLIC",
  //         TransactionCode: "DCIN",
  //         CustomerCode: "CF100005",
  //         SalesLocationCode: "FG101",
  //         DeliveryLocationCode: "FG101",
  //         UserId: "SYSADMIN",
  //         Item: [
  //           {
  //             "Item-Code": "4435",
  //             Size: "39",
  //             Rate: "85",
  //             Qty: "1",
  //             UserId: "SYSADMIN",
  //           },
  //         ],
  //       },
  //     ],
  //     COMPANY: "SLIC",
  //     USERID: "SYSADMIN",
  //     APICODE: "INVOICE",
  //     LANG: "ENG",
  //   }

  const data = JSON.stringify(req.body);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
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
          return next(new Error(`HTTP error! status: ${response.statusCode}`));
        }
      });
    });

    request.on("error", (error) => {
      console.error("Error calling API:", error);
      if (error instanceof CustomError) {
        return next(error);
      }
      error.message = null;
      return next(error);
    });

    request.write(data);
    request.end();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
