// src/utils/api.js
import { toast } from 'react-toastify';
import ErpTeamRequest from '../ErpTeamRequest';
import newRequest from '../userRequest';

// Fetch barcode data from the first API
export const fetchBarcodeData = async (barcode) => {
  try {
    const response = await newRequest.get(`/itemCodes/v2/searchByGTIN?GTIN=${barcode}`);
    return response?.data?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Error fetching barcode data");
    throw error;
  }
};

// Fetch additional data from the second API
export const fetchSecondApiData = async (ItemCode, ProductSize, token) => {
  const secondApiBody = {
    filter: {
      P_COMP_CODE: 'SLIC',
      P_ITEM_CODE: ItemCode,
      P_CUST_CODE: 'CL100948',
      P_GRADE_CODE_1: ProductSize,
    },
    M_COMP_CODE: 'SLIC',
    M_USER_ID: 'SYSADMIN',
    APICODE: 'PRICELIST',
    M_LANG_CODE: 'ENG',
  };

  try {
    const response = await ErpTeamRequest.post('/slicuat05api/v1/getApi', secondApiBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Error fetching second API data");
    throw error;
  }
};

// Fetch invoice details by invoice number
export const fetchInvoiceDetails = async (invoiceNumber) => {
  try {
    const response = await newRequest.get(`/invoice/v1/headers-and-line-items?InvoiceNo=${invoiceNumber}`);
    return response?.data?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Error fetching invoice details");
    throw error;
  }
};

// Fetch transaction codes based on location
export const fetchTransactionCodes = async (locationCode) => {
  try {
    const response = await newRequest.get(`/transactions/v1/byLocationCode?locationCode=${locationCode}`);
    return response?.data?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Error fetching transaction codes");
    throw error;
  }
};

// Fetch customer names
export const fetchCustomerNames = async () => {
  try {
    const response = await newRequest.get('/customerNames/v1/all');
    return response?.data?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Error fetching customer names");
    throw error;
  }
};
