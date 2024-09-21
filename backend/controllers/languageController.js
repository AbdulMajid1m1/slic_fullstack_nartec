const languages = require("../models/languageModel");
const CustomError = require("../exceptions/customError");
const generateResponse = require("../utils/response");
exports.getAll = async (req, res, next) => {
    try {
      const lanaguagesData = await languages.fetchAll();
      if (lanaguagesData.length <= 0) {
        const error = new CustomError("Couldn't find any languages");
        error.statusCode = 404;
        throw error;
      }
      let formattedData = {};
    
      // Loop through the data and populate the formatted object
      lanaguagesData.forEach(item =>
      {
          formattedData[item.key] = item.value;
      });
      res
        .status(200)
        .json(
          generateResponse(
            200,
            true,
            "Records retrieved successfully",
            formattedData
          )
        );
    } catch (error) {
      next(error);
    }
  };

  exports.fortable = async (req, res, next) => {
    try {
      const langaugeData = await languages.fortable();
      if (!langaugeData) {
        const error = new CustomError("Couldn't find the languages");
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json(
          generateResponse(200, true, "Record retrieved successfully", langaugeData)
        );
    } catch (error) {
      next(error);
    }
   
  };
  exports.createlanguages = async (req, res, next) => {
    try {
      const data = req.body;
      const newOrder = await languages.create(data);
      res
        .status(201)
        .json(
          generateResponse(201, true, "Record created successfully", newOrder)
        );
    } catch (error) {
      next(error);
    }
  }
  exports.updatelanguages = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const updatedOrder = await languages.update(id, data);
      res
        .status(200)
        .json(
          generateResponse(200, true, "Record updated successfully", updatedOrder)
        );
    } catch (error) {
      next(error);
    }
  };