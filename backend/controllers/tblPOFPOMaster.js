const POFPOPModel = require("../models/tblPOFPOMaster");
const generateResponse = require("../utils/response");
const CustomError = require("../exceptions/customError");

// Create a new record
exports.createRecord = async (req, res, next) => {
  try {
    const data = req.body;
    const newRecord = await POFPOPModel.create(data);
    res
      .status(201)
      .json(
        generateResponse(201, true, "Record created successfully", newRecord)
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

// Read all records
exports.getAllRecords = async (req, res, next) => {
  try {
    const records = await POFPOPModel.findAll();
    res
      .status(200)
      .json(
        generateResponse(200, true, "Records retrieved successfully", records)
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

// Read paginated records
exports.getPaginatedRecords = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await POFPOPModel.findPaginated(
      parseInt(page),
      parseInt(limit)
    );
    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Paginated records retrieved successfully",
          result
        )
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

// Read a single record by ID
exports.getRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await POFPOPModel.findById(parseInt(id));
    if (record) {
      res
        .status(200)
        .json(
          generateResponse(200, true, "Record retrieved successfully", record)
        );
    } else {
      const error = new CustomError("Record not found");
      error.statusCode = 404;
      throw error;
    }
  } catch (error) {
    console.error(error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};

// Update a record by ID
exports.updateRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedRecord = await POFPOPModel.update(parseInt(id), data);
    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Record updated successfully",
          updatedRecord
        )
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

// Delete a record by ID
exports.deleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRecord = await POFPOPModel.delete(parseInt(id));
    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Record deleted successfully",
          deletedRecord
        )
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
