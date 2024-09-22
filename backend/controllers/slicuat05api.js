// const axios = require("axios");
// const { CustomError } = require("../exceptions/customError");

// exports.slicLogin = async (req, res, next) => {
//   const url = "https://slicapi.oneerpcloud.com/oneerpauth/api/login";
//   const { apiKey } = req.body;

//   const data = {
//     apiKey: apiKey,
//   };

//   const headers = {
//     "Content-Type": "application/json",
//     "X-tenanttype": "live",
//   };

//   try {
//     const response = await axios.post(url, data, { headers });

//     res.status(response.status).json(response.data);
//   } catch (error) {
//     console.error("Error verifying email:", error);
//     if (error.response) {
//       // Server responded with a status other than 200 range
//       return next(new Error(`HTTP error! status: ${error.response.status}`));
//     }
//     next(error instanceof CustomError ? error : new Error("Unexpected error"));
//   }
// };

// exports.slicGetApi = async (req, res, next) => {
//   const url = "https://slicapi.oneerpcloud.com/oneerpreport/api/getapi";
//   const { authorization } = req.headers;
//   const requestBody = req.body;

//   if (!authorization || !authorization.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .json({ message: "Authorization token is missing or invalid" });
//   }

//   const token = authorization.split(" ")[1];

//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };

//   try {
//     const response = await axios.post(url, requestBody, { headers });

//     res.status(response.status).json(response.data);
//   } catch (error) {
//     console.error("Error calling API:", error);
//     if (error.response) {
//       // Server responded with a status other than 200 range
//       return next(new Error(`HTTP error! status: ${error.response.status}`));
//     }
//     next(error instanceof CustomError ? error : new Error("Unexpected error"));
//   }
// };

// exports.slicPostData = async (req, res, next) => {
//   const url = "https://slicapi.oneerpcloud.com/oneerpreport/api/postdata";
//   const { authorization } = req.headers;

//   if (!authorization || !authorization.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .json({ message: "Authorization token is missing or invalid" });
//   }

//   const token = authorization.split(" ")[1];

//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };

//   try {
//     const response = await axios.post(url, req.body, { headers });

//     res.status(response.status).json(response.data);
//   } catch (error) {
//     console.error("Error calling API:", error);
//     if (error.response) {
//       // Server responded with a status other than 200 range
//       return next(new Error(`HTTP error! status: ${error.response.status}`));
//     }
//     next(error instanceof CustomError ? error : new Error("Unexpected error"));
//   }
// };

const axios = require("axios");

exports.slicLogin = async (req, res) => {
  const url = "https://slicapi.oneerpcloud.com/oneerpauth/api/login";
  const { apiKey } = req.body;

  const data = {
    apiKey: apiKey,
  };

  const headers = {
    "Content-Type": "application/json",
    "X-tenanttype": "live",
  };

  try {
    const response = await axios.post(url, data, { headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying API key:", error);
    if (error.response) {
      // Return the error response from the third-party server
      return res.status(error.response.status).json(error.response.data);
    }
    // Return a generic error if no response is available
    res.status(500).json({ message: "Unexpected error" });
  }
};

exports.slicGetApi = async (req, res) => {
  const url = "https://slicapi.oneerpcloud.com/oneerpreport/api/getapi";
  const { authorization } = req.headers;
  const requestBody = req.body;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token is missing or invalid" });
  }

  const token = authorization.split(" ")[1];

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await axios.post(url, requestBody, { headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error calling API:", error);
    if (error.response) {
      // Return the error response from the third-party server
      return res.status(error.response.status).json(error.response.data);
    }
    // Return a generic error if no response is available
    res.status(500).json({ message: "Unexpected error" });
  }
};

exports.slicPostData = async (req, res) => {
  const url = "https://slicapi.oneerpcloud.com/oneerpreport/api/postdata";
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token is missing or invalid" });
  }

  const token = authorization.split(" ")[1];

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await axios.post(url, req.body, { headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error calling API:", error);
    if (error.response) {
      // Return the error response from the third-party server
      return res.status(error.response.status).json(error.response.data);
    }
    // Return a generic error if no response is available
    res.status(500).json({ message: "Unexpected error" });
  }
};
