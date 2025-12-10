const mod10CheckDigit = require("mod10-check-digit");
const { validationResult } = require("express-validator");
const XLSX = require("xlsx");

const ItemCodeModel = require("../models/tblItemCodes1S1Br");
const BarSeriesNo = require("../models/barSeriesNo");
const generateResponse = require("../utils/response");
const CustomError = require("../exceptions/customError");
const { deleteFile } = require("../utils/file");

function calculateCheckDigit(gtinWithoutCheckDigit) {
  const digits = gtinWithoutCheckDigit.split("").map(Number);
  let sum = 0;

  // EAN-13 check digit calculation (modulo-10 algorithm)
  for (let i = 0; i < digits.length; i++) {
    sum += i % 2 === 0 ? digits[i] * 1 : digits[i] * 3;
  }

  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;

  return checkDigit.toString();
}

async function generateBarcode(id) {
  const GCP = "6287898";
  const seriesNo = await BarSeriesNo.getBarSeriesNo(id);

  if (!seriesNo) {
    throw new CustomError("BarSeriesNo not found", 404);
  }

  // Construct the base barcode
  const baseBarcode = `${GCP}${seriesNo.BarSeriesNo}`;

  // Add a leading zero if the base barcode length is 11
  let barcode;
  if (baseBarcode.length === 11) {
    barcode = `${GCP}0${seriesNo.BarSeriesNo}`;
  } else if (baseBarcode.length === 12) {
    barcode = baseBarcode;
  } else {
    throw new CustomError("BarSeriesNo is not in a valid format", 400);
  }

  // Calculate the check digit and append it
  const CHECK_DIGIT = calculateCheckDigit(barcode);
  barcode += CHECK_DIGIT;

  if (barcode.length !== 13) {
    throw new CustomError("Generated barcode is not 13 characters long", 500);
  }

  // Increment the BarSeriesNo for the next generation
  const number = (Number(seriesNo.BarSeriesNo) + 1).toString();
  const result = await BarSeriesNo.updateBarSeriesNo(id, number);

  if (!result) {
    throw new CustomError("Failed to update BarSeriesNo", 500);
  }

  return barcode;
}
exports.getItemCodes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || null;

    const result = await ItemCodeModel.findAllWithPagination(
      page,
      limit,
      search
    );
    const { itemCodes, pagination } = result;

    if (!itemCodes || itemCodes.length <= 0) {
      const error = new CustomError("No item codes found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(
      generateResponse(200, true, "Item codes retrieved successfully", {
        itemCodes,
        pagination,
      })
    );
  } catch (error) {
    next(error);
  }
};

exports.getAllItemCodes = async (req, res, next) => {
  try {
    const result = await ItemCodeModel.findAll();

    if (!result || result.length <= 0) {
      const error = new CustomError("No item codes found");
      error.statusCode = 404;
      return next(error);
    }

    res
      .status(200)
      .json(
        generateResponse(200, true, "Item codes retrieved successfully", result)
      );
  } catch (error) {
    console.log(error);
    if (error instanceof CustomError) {
      return next(error);
    }
    error.message = null;
    next(error);
  }
};

// exports.updateGTINs = async (req, res, next) => {
//   try {
//     // Fetch all item codes
//     const itemCodes = await ItemCodeModel.findAll();

//     // Update each item code with the correct check digit
//     const updatePromises = itemCodes.map(async (item) => {
//       if (item.GTIN && item.GTIN.length === 13) {
//         const gtinWithoutCheckDigit = item.GTIN.slice(0, 12);
//         const correctCheckDigit = calculateCheckDigit(gtinWithoutCheckDigit);
//         const updatedGTIN = `${gtinWithoutCheckDigit}${correctCheckDigit}`;

//         // Update the record only if it needs correction
//         if (updatedGTIN !== item.GTIN) {
//           return await ItemCodeModel.update(item.id, { GTIN: updatedGTIN });
//         }
//       }
//     });

//     await Promise.all(updatePromises);

//     res.status(200).json({ message: "GTINs updated successfully" });
//   } catch (error) {
//     next(error);
//   }
// };

exports.postItemCode = async (req, res, next) => {
  try {
    const { itemCode, quantity, description, startSize, endSize } = req.body;

    const barcode = await generateBarcode(1);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new CustomError(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    // // Convert date fields to ISO-8601 strings
    // if (body.ExpiryDate) {
    //   body.ExpiryDate = new Date(body.ExpiryDate).toISOString();
    // }
    // if (body.ProductionDate) {
    //   body.ProductionDate = new Date(body.ProductionDate).toISOString();
    // }

    // const _itemCode = await ItemCodeModel.create(req.body);

    const body = {
      GTIN: barcode,
      ItemCode: itemCode,
      ItemQty: Number(quantity),
      EnglishName: description,
      ArabicName: description,
      QRCodeInternational: barcode,
      ProductSize: startSize,
    };
    const _itemCode = await ItemCodeModel.create(body);

    res
      .status(201)
      .json(
        generateResponse(201, true, "Item code created successfully", _itemCode)
      );
  } catch (error) {
    next(error);
  }
};

exports.postItemCodeV2 = async (req, res, next) => {
  let imagePath = null;
  try {
    const {
      itemCode,
      quantity,
      description,
      startSize,
      endSize,
      upper,
      sole,
      width,
      color,
      label,
    } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.errors[0].msg;
      const error = new CustomError(msg);
      error.statusCode = 422;
      error.data = errors;
      return next(error);
    }

    const numRecords = endSize - startSize + 1;
    let recordsCreated = [];

    for (let size = startSize; size <= endSize; size++) {
      const barcode = await generateBarcode(1);
      const body = {
        GTIN: barcode,
        ItemCode: itemCode,
        ItemQty: 1,
        EnglishName: description,
        ArabicName: description,
        QRCodeInternational: barcode,
        ProductSize: size.toString(),
        upper: upper,
        sole: sole,
        width: width,
        color: color,
        label: label,
      };

      if (req.file) {
        imagePath = req.file.path; // Store the path of the uploaded image
        body.image = imagePath; // Add the image path to the body
      }

      const _itemCode = await ItemCodeModel.create(body);
      recordsCreated.push(_itemCode);
    }

    res
      .status(201)
      .json(
        generateResponse(
          201,
          true,
          "Item codes created successfully",
          recordsCreated
        )
      );
  } catch (error) {
    if (imagePath) {
      await deleteFile(imagePath);
    }
    next(error);
  }
};

exports.putItemCode = async (req, res, next) => {
  let imagePath = null;
  try {
    const GTIN = req.params.GTIN;

    const existingItemCode = await ItemCodeModel.findById(GTIN);

    if (!existingItemCode) {
      const error = new CustomError("Item code not found");
      error.statusCode = 404;
      throw error;
    }

    const {
      itemCode,
      quantity,
      description,
      startSize,
      ArabicName,
      endSize,
      upper,
      sole,
      width,
      color,
      label,
    } = req.body;

    // Prepare the updated data
    const updatedData = {
      ItemCode: itemCode || existingItemCode.ItemCode,
      ItemQty:
        quantity !== undefined ? Number(quantity) : existingItemCode.ItemQty,
      EnglishName: description || existingItemCode.EnglishName,
      ArabicName: ArabicName || existingItemCode.ArabicName,
      ProductSize: startSize || existingItemCode.ProductSize,
      upper: upper !== undefined ? upper : existingItemCode.upper,
      sole: sole !== undefined ? sole : existingItemCode.sole,
      width: width !== undefined ? width : existingItemCode.width,
      color: color !== undefined ? color : existingItemCode.color,
      label: label !== undefined ? label : existingItemCode.label,
    };

    if (req.file) {
      imagePath = req.file.path; // Store the path of the uploaded image
      updatedData.image = imagePath; // Add the new image path to the updated data
      // delete old image if exists
      if (existingItemCode.image) {
        await deleteFile(existingItemCode.image);
      }
    }

    // Save the updated item code data
    const updatedItemCode = await ItemCodeModel.update(
      existingItemCode.id,
      updatedData
    );

    if (!updatedItemCode) {
      const error = new CustomError(`Couldn't update item code`);
      error.statusCode = 500;
      throw error;
    }

    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Item code updated successfully",
          updatedItemCode
        )
      );
  } catch (error) {
    if (imagePath) {
      await deleteFile(imagePath);
    }
    next(error);
  }
};

exports.deleteItemCode = async (req, res, next) => {
  try {
    const GTIN = req.params.GTIN;
    const itemCode = await ItemCodeModel.findById(GTIN);
    if (!itemCode) {
      const error = new CustomError("Item code not found");
      error.statusCode = 404;
      throw error;
    }
    // Delete the item code
    const deletedItemCode = await ItemCodeModel.deleteById(itemCode.id);
    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Item code deleted successfully",
          deletedItemCode
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.searchByPartialGTIN = async (req, res, next) => {
  try {
    const GTIN = req.query.GTIN;
    const itemCodes = await ItemCodeModel.searchByGtin(GTIN);
    if (!itemCodes || itemCodes.length <= 0) {
      const error = new CustomError("No item codes found with the given GTIN");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Item code retrieved successfully",
          itemCodes
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.searchByGTIN = async (req, res, next) => {
  try {
    const GTIN = req.query.GTIN;
    const itemCode = await ItemCodeModel.findById(GTIN);
    if (!itemCode) {
      const error = new CustomError("No item code found with the given GTIN");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(200)
      .json(
        generateResponse(
          200,
          true,
          "Item code retrieved successfully",
          itemCode
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.findByItemCode = async (req, res, next) => {
  try {
    const itemCode = req.query.itemCode;
    const item = await ItemCodeModel.findByItemCode(itemCode);
    if (!item) {
      const error = new CustomError("No item code found");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(200)
      .json(
        generateResponse(200, true, "Item code retrieved successfully", item)
      );
  } catch (error) {
    next(error);
  }
};

exports.putMultipleItemCodes = async (req, res, next) => {
  let imagePath = null;
  try {
    const { itemCode, sizes } = req.body;
    let updateData = {};

    // Parse updateData if it's a string (from form-data)
    if (req.body.updateData) {
      try {
        updateData =
          typeof req.body.updateData === "string"
            ? JSON.parse(req.body.updateData)
            : req.body.updateData;
      } catch (e) {
        const error = new CustomError("Invalid updateData format");
        error.statusCode = 400;
        throw error;
      }
    }

    // Validate that itemCode exists
    if (!itemCode) {
      const error = new CustomError("ItemCode is required");
      error.statusCode = 400;
      throw error;
    }

    // Validate that sizes array exists and is not empty
    let sizesArray = sizes;
    if (typeof sizes === "string") {
      try {
        sizesArray = JSON.parse(sizes);
      } catch (e) {
        const error = new CustomError("Invalid sizes format");
        error.statusCode = 400;
        throw error;
      }
    }

    if (!sizesArray || !Array.isArray(sizesArray) || sizesArray.length === 0) {
      const error = new CustomError(
        "Sizes array is required and cannot be empty"
      );
      error.statusCode = 400;
      throw error;
    }

    // Get existing records before update to handle image deletion
    const existingRecords = await ItemCodeModel.findManyByItemCodeAndSizes(
      itemCode,
      sizesArray
    );

    if (!existingRecords || existingRecords.length === 0) {
      const error = new CustomError(
        "No item codes found with the provided ItemCode and sizes"
      );
      error.statusCode = 404;
      throw error;
    }

    // Prepare the data to be updated (only include fields that are provided)
    const dataToUpdate = {};

    if (updateData.ItemQty !== undefined)
      dataToUpdate.ItemQty = Number(updateData.ItemQty);
    if (updateData.EnglishName !== undefined)
      dataToUpdate.EnglishName = updateData.EnglishName;
    if (updateData.ArabicName !== undefined)
      dataToUpdate.ArabicName = updateData.ArabicName;
    if (updateData.upper !== undefined) dataToUpdate.upper = updateData.upper;
    if (updateData.sole !== undefined) dataToUpdate.sole = updateData.sole;
    if (updateData.width !== undefined) dataToUpdate.width = updateData.width;
    if (updateData.color !== undefined) dataToUpdate.color = updateData.color;
    if (updateData.label !== undefined) dataToUpdate.label = updateData.label;

    // Handle image upload - applies to all selected products
    if (req.file) {
      imagePath = req.file.path;
      dataToUpdate.image = imagePath;

      // Delete old images from all affected records
      for (const record of existingRecords) {
        if (record.image) {
          await deleteFile(record.image);
        }
      }
    }

    // Validate that there's something to update
    if (Object.keys(dataToUpdate).length === 0) {
      const error = new CustomError("Update data is required");
      error.statusCode = 400;
      throw error;
    }

    // Perform bulk update
    const result = await ItemCodeModel.updateManyByItemCodeAndSizes(
      itemCode,
      sizesArray,
      dataToUpdate
    );

    if (!result || result.count === 0) {
      const error = new CustomError(
        "No item codes were updated. Please check if the provided ItemCode and sizes exist."
      );
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(
      generateResponse(
        200,
        true,
        `${result.count} item code(s) updated successfully`,
        {
          updatedCount: result.count,
          itemCode,
          sizes: sizesArray,
          imageUpdated: !!req.file,
        }
      )
    );
  } catch (error) {
    // Clean up uploaded image if there was an error
    if (imagePath) {
      await deleteFile(imagePath);
    }
    next(error);
  }
};

exports.bulkImportFromExcel = async (req, res, next) => {
  let filePath = null;
  try {
    // Check if file is uploaded
    if (!req.file) {
      const error = new CustomError("Excel/CSV file is required");
      error.statusCode = 400;
      throw error;
    }

    filePath = req.file.path;

    // Read the Excel/CSV file
    const workbook = XLSX.readFile(filePath);

    const results = {
      success: [],
      failed: [],
      total: 0,
      created: 0,
      updated: 0,
      sheetsProcessed: 0,
    };

    const BATCH_SIZE = 2000; // Process 2000 records at a time for better performance (optimized for 100k+ records)

    // Process all sheets in the workbook (skip first sheet if it's metadata)
    for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
      const sheetName = workbook.SheetNames[sheetIndex];

      // Skip first sheet if it's named "PRODUCTION DATE" or similar metadata sheets
      if (sheetIndex === 0 && (
        sheetName.toLowerCase().includes('production date') ||
        sheetName.toLowerCase().includes('metadata') ||
        sheetName.toLowerCase().includes('summary')
      )) {
        continue;
      }

      const worksheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData || jsonData.length === 0) {
        continue; // Skip empty sheets
      }

      results.total += jsonData.length;
      results.sheetsProcessed++;

      // Helper function to get value from row with multiple possible column names
      const getValue = (row, possibleNames, convertToString = false) => {
        for (const name of possibleNames) {
          if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
            const value = row[name];
            // Convert to string if requested and value is not null/undefined
            if (convertToString && value !== null && value !== undefined) {
              return String(value).trim();
            }
            return value;
          }
        }
        return null;
      };

      // Parse production date (handle "i-025" format and Excel serial dates)
      const parseProductionDate = (dateValue) => {
        if (!dateValue) return null;

        // If it's already a date object or number (Excel serial date)
        if (dateValue instanceof Date) return dateValue;
        if (typeof dateValue === 'number') {
          // Excel serial date to JS Date
          return new Date((dateValue - 25569) * 86400 * 1000);
        }

        // If it's a string like "i-025", try to parse it or return null
        if (typeof dateValue === 'string') {
          // Try parsing as ISO date first
          const parsedDate = new Date(dateValue);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }

        return null;
      };

      // Process records in batches
      for (let batchStart = 0; batchStart < jsonData.length; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, jsonData.length);
        const batchData = jsonData.slice(batchStart, batchEnd);

        const validRecords = [];
        const invalidRecords = [];

        // Validate and prepare batch data
        for (let i = 0; i < batchData.length; i++) {
          try {
            const row = batchData[i];
            const actualRowIndex = batchStart + i;

            // Prepare data for insertion with flexible column mapping
            const itemData = {
              ItemCode: getValue(row, ['STYLE', 'Style', 'ItemCode', 'Item Code', 'itemCode', 'item_code'], true),
              EnglishName: getValue(row, ['EnglishName', 'English Name', 'Name', 'Product Name', 'englishName'], true),
              ArabicName: getValue(row, ['ArabicName', 'Arabic Name', 'arabicName', 'arabic_name'], true),
              GTIN: getValue(row, ['BARCODE', 'Barcode', 'barcode', 'GTIN', 'gtin', 'EAN', 'UPC'], true),
              LotNo: getValue(row, ['LotNo', 'Lot No', 'Lot Number', 'lotNo', 'lot_no'], true),
              ExpiryDate: getValue(row, ['ExpiryDate', 'Expiry Date', 'expiryDate', 'expiry_date'])
                ? parseProductionDate(getValue(row, ['ExpiryDate', 'Expiry Date', 'expiryDate', 'expiry_date']))
                : null,
              sERIALnUMBER: getValue(row, ['sERIALnUMBER', 'SerialNumber', 'Serial Number', 'Serial Num', 'Serial', 'serialNumber', 'serial_number'], true),
              ItemQty: getValue(row, ['ItemQty', 'Item Qty', 'Quantity', 'Qty', 'itemQty', 'quantity'])
                ? parseInt(getValue(row, ['ItemQty', 'Item Qty', 'Quantity', 'Qty', 'itemQty', 'quantity']))
                : 0,
              WHLocation: getValue(row, ['WHLocation', 'WH Location', 'Warehouse Location', 'whLocation', 'wh_location'], true),
              BinLocation: getValue(row, ['BinLocation', 'Bin Location', 'Bin', 'binLocation', 'bin_location'], true),
              QRCodeInternational: (getValue(row, ['QRCodeInternational', 'QR Code', 'QRCode', 'qrCode', 'qr_code'], true)
                || getValue(row, ['BARCODE', 'Barcode', 'barcode', 'GTIN', 'gtin'], true)),
              ModelName: getValue(row, ['STEEL MID', 'Steel Mid', 'ModelName', 'Model Name', 'Model', 'modelName', 'model_name'], true),
              ProductionDate: parseProductionDate(getValue(row, ['PRO DATE', 'Pro Date', 'ProductionDate', 'Production Date', 'productionDate', 'production_date'])),
              ProductType: getValue(row, ['ProductType', 'Product Type', 'Type', 'productType', 'product_type'], true),
              BrandName: getValue(row, ['BrandName', 'Brand Name', 'Brand', 'brandName', 'brand_name'], true),
              PackagingType: getValue(row, ['PackagingType', 'Packaging Type', 'Packaging', 'packagingType', 'packaging_type'], true),
              ProductUnit: getValue(row, ['ProductUnit', 'Product Unit', 'Unit', 'productUnit', 'product_unit'], true),
              ProductSize: getValue(row, ['SIZE', 'Size', 'ProductSize', 'Product Size', 'productSize', 'product_size'], true),
              image: getValue(row, ['image', 'Image', 'ImagePath', 'image_path'], true),
              upper: getValue(row, ['upper', 'Upper'], true),
              sole: getValue(row, ['sole', 'Sole'], true),
              width: getValue(row, ['WIDTH', 'Width', 'width'], true),
              color: getValue(row, ['COLOR', 'Color', 'Colour', 'colour', 'color'], true),
              label: getValue(row, ['label', 'Label'], true),
            };

            // Remove null/undefined fields to avoid Prisma errors
            Object.keys(itemData).forEach(key => {
              if (itemData[key] === null || itemData[key] === undefined) {
                delete itemData[key];
              }
            });

            validRecords.push({
              data: itemData,
              rowIndex: actualRowIndex,
            });
          } catch (error) {
            const row = batchData[i];
            const actualRowIndex = batchStart + i;

            invalidRecords.push({
              sheet: sheetName,
              row: actualRowIndex + 2,
              ItemCode: getValue(row, ['STYLE', 'Style', 'ItemCode', 'Item Code', 'itemCode', 'item_code'], true),
              GTIN: getValue(row, ['BARCODE', 'Barcode', 'barcode', 'GTIN', 'gtin'], true),
              error: `Validation error: ${error.message}`,
            });
          }
        }

        // Batch upsert valid records (insert new, update existing)
        if (validRecords.length > 0) {
          try {
            const batchUpsertData = validRecords.map(r => r.data);
            const startTime = Date.now();

            // Use bulkUpsert for MSSQL compatibility (no skipDuplicates)
            const upsertResult = await ItemCodeModel.bulkUpsert(batchUpsertData);

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            // Add successful records to results
            validRecords.forEach((record) => {
              results.success.push({
                sheet: sheetName,
                row: record.rowIndex + 2,
                ItemCode: record.data.ItemCode,
                GTIN: record.data.GTIN,
              });
            });

            results.created += upsertResult.created;
            results.updated += upsertResult.updated;

            console.log(
              `Batch ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(jsonData.length / BATCH_SIZE)}: ` +
              `Created ${upsertResult.created}, Updated ${upsertResult.updated} records (${duration}s) - ` +
              `Progress: ${Math.min(batchEnd, jsonData.length)}/${jsonData.length} records`
            );
          } catch (error) {
            // If batch upsert fails, try individual upserts to identify problematic records
            console.log(`Batch upsert failed, trying individual operations: ${error.message}`);

            for (const record of validRecords) {
              try {
                if (record.data.GTIN) {
                  await ItemCodeModel.upsert(record.data.GTIN, record.data);
                } else {
                  await ItemCodeModel.create(record.data);
                }
                results.success.push({
                  sheet: sheetName,
                  row: record.rowIndex + 2,
                  ItemCode: record.data.ItemCode,
                  GTIN: record.data.GTIN,
                });
                results.created++;
              } catch (individualError) {
                results.failed.push({
                  sheet: sheetName,
                  row: record.rowIndex + 2,
                  ItemCode: record.data.ItemCode,
                  GTIN: record.data.GTIN,
                  error: individualError.message,
                });
              }
            }
          }
        }

        // Add pre-validated failed records
        results.failed.push(...invalidRecords);
      }
    }

    // Clean up uploaded file
    if (filePath) {
      await deleteFile(filePath);
    }

    if (results.total === 0) {
      const error = new CustomError("Excel/CSV file has no data to import");
      error.statusCode = 400;
      throw error;
    }

    const statusCode = results.failed.length === 0 ? 201 : 207; // 207 Multi-Status
    const message =
      results.failed.length === 0
        ? `All items imported successfully (${results.created} created, ${results.updated} updated)`
        : `Imported ${results.success.length} items (${results.created} created, ${results.updated} updated), ${results.failed.length} failed`;

    res.status(statusCode).json(
      generateResponse(statusCode, true, message, {
        successCount: results.success.length,
        failedCount: results.failed.length,
        createdCount: results.created,
        updatedCount: results.updated,
        total: results.total,
        sheetsProcessed: results.sheetsProcessed,
        successRecords: results.success.slice(0, 100), // Limit response size for large imports
        failedRecords: results.failed.slice(0, 100), // Limit response size
        note: results.success.length > 100 || results.failed.length > 100
          ? "Only first 100 records shown in response. Check server logs for complete details."
          : null,
      })
    );
  } catch (error) {
    // Clean up uploaded file in case of error
    if (filePath) {
      await deleteFile(filePath);
    }
    next(error);
  }
};

exports.removeDuplicateGTINs = async (req, res, next) => {
  try {
    console.log("Starting duplicate GTIN removal process...");
    const startTime = Date.now();

    // Find all duplicate GTINs
    const duplicateGTINs = await ItemCodeModel.findDuplicateGTINs();

    if (!duplicateGTINs || duplicateGTINs.length === 0) {
      return res.status(200).json(
        generateResponse(200, true, "No duplicate GTINs found", {
          duplicatesFound: 0,
          recordsRemoved: 0,
        })
      );
    }

    console.log(`Found ${duplicateGTINs.length} duplicate GTINs`);

    let totalRecordsRemoved = 0;
    let processedCount = 0;
    const details = [];

    // Score a record based on how many fields are filled
    const scoreRecord = (record) => {
      let score = 0;
      const fieldsToCheck = [
        'ItemCode', 'EnglishName', 'ArabicName', 'GTIN', 'LotNo',
        'ExpiryDate', 'sERIALnUMBER', 'ItemQty', 'WHLocation',
        'BinLocation', 'QRCodeInternational', 'ModelName',
        'ProductionDate', 'ProductType', 'BrandName', 'PackagingType',
        'ProductUnit', 'ProductSize', 'image', 'upper', 'sole',
        'width', 'color', 'label'
      ];

      fieldsToCheck.forEach((field) => {
        if (record[field] !== null && record[field] !== undefined && record[field] !== '') {
          score++;
        }
      });

      return score;
    };

    // Process duplicates in batches
    const BATCH_SIZE = 100; // Process 100 duplicate GTINs at a time

    for (let i = 0; i < duplicateGTINs.length; i += BATCH_SIZE) {
      const batch = duplicateGTINs.slice(i, Math.min(i + BATCH_SIZE, duplicateGTINs.length));

      for (const duplicate of batch) {
        const gtin = duplicate.GTIN;
        const count = parseInt(duplicate.count);

        // Get all records with this GTIN
        const records = await ItemCodeModel.findAllByGTIN(gtin);

        if (records.length <= 1) {
          continue; // Skip if not actually duplicate
        }

        // Score each record
        const scoredRecords = records.map((record) => ({
          ...record,
          score: scoreRecord(record),
        }));

        // Sort by score (highest first), then by Created_at (most recent first)
        scoredRecords.sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return new Date(b.Created_at) - new Date(a.Created_at);
        });

        // Keep the first one (highest score), delete the rest
        const recordToKeep = scoredRecords[0];
        const recordsToDelete = scoredRecords.slice(1);

        if (recordsToDelete.length > 0) {
          const idsToDelete = recordsToDelete.map((r) => r.id);
          await ItemCodeModel.deleteByIds(idsToDelete);
          totalRecordsRemoved += idsToDelete.length;

          details.push({
            gtin,
            totalRecords: records.length,
            recordsRemoved: idsToDelete.length,
            keptRecordId: recordToKeep.id,
            keptRecordScore: recordToKeep.score,
          });
        }

        processedCount++;

        // Log progress every 100 GTINs
        if (processedCount % 100 === 0) {
          console.log(
            `Progress: ${processedCount}/${duplicateGTINs.length} GTINs processed, ` +
            `${totalRecordsRemoved} records removed`
          );
        }
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(
      `Duplicate removal completed: ${totalRecordsRemoved} records removed in ${duration}s`
    );

    res.status(200).json(
      generateResponse(200, true, "Duplicate GTINs removed successfully", {
        duplicateGTINsFound: duplicateGTINs.length,
        recordsRemoved: totalRecordsRemoved,
        duration: `${duration}s`,
        details: details.slice(0, 100), // Return first 100 for reference
        note: details.length > 100
          ? "Only first 100 details shown. Check server logs for complete information."
          : null,
      })
    );
  } catch (error) {
    console.error("Error removing duplicates:", error);
    next(error);
  }
};
