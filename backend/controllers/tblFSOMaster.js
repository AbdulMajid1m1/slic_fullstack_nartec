const CustomError = require("../exceptions/customError");
const generateResponse = require("../utils/response");
const SalesOrders = require("../models/tblFSOMaster");

exports.getAll = async (req, res, next) => {
  try {
    const salesOrders = await SalesOrders.fetchAll();
    if (salesOrders.length <= 0) {
      const error = new CustomError("Couldn't find any sales orders");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Records retrieved successfully",
          salesOrders
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const data = req.body;
    const newOrder = await SalesOrders.create(data);
    res
      .status(201)
      .json(
        generateResponse(201, true, "Record created successfully", newOrder)
      );
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const soNumber = req.params.soNumber;
    const order = await SalesOrders.findBySONumber(soNumber);
    if (!order) {
      const error = new CustomError("Couldn't find the sales order");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(200)
      .json(
        generateResponse(200, true, "Record retrieved successfully", order)
      );
  } catch (error) {
    next(error);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const soNumber = req.params.soNumber;
    const data = req.body;
    const updatedOrder = await SalesOrders.update(soNumber, data);
    res
      .status(200)
      .json(
        generateResponse(200, true, "Record updated successfully", updatedOrder)
      );
  } catch (error) {
    next(error);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const soNumber = req.params.soNumber;
    await SalesOrders.delete(soNumber);
    res
      .status(200)
      .json(generateResponse(200, true, "Record deleted successfully", null));
  } catch (error) {
    console.error(error);
    next(error);
  }
};
