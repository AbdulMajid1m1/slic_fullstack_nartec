// src/hooks/usePOSUtils.js

import { useEffect, useState } from "react";

export const useStoredCompanyData = (setSelectedCompany) => {
  useEffect(() => {
    const storedCompanyData = sessionStorage.getItem("selectedCompany");
    if (storedCompanyData) {
      const companyData = JSON.parse(storedCompanyData);
      setSelectedCompany(companyData);
    }
  }, [setSelectedCompany]);
};

export const useStoredLocationData = (setSelectedLocation) => {
  useEffect(() => {
    const storedLocationData = sessionStorage.getItem("selectedLocation");
    if (storedLocationData) {
      const locationData = JSON.parse(storedLocationData);
      setSelectedLocation(locationData);
    }
  }, [setSelectedLocation]);
};

export const useFetchTransactionCodes = (selectedLocation, setTransactionCodes) => {
  useEffect(() => {
    const fetchTransactionCodes = async () => {
      try {
        const response = await newRequest.get(`/transactions/v1/byLocationCode?locationCode=${selectedLocation?.LOCN_CODE}`);
        setTransactionCodes(response.data?.data);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Something went wrong");
      }
    };

    if (selectedLocation?.LOCN_CODE) {
      fetchTransactionCodes();
    }
  }, [selectedLocation, setTransactionCodes]);
};

export const useFetchCustomerNames = (setSearchCustomerName) => {
  useEffect(() => {
    const fetchCustomerNames = async () => {
      try {
        const response = await newRequest.get("/customerNames/v1/all");
        setSearchCustomerName(response?.data?.data);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Something went wrong");
      }
    };

    fetchCustomerNames();
  }, [setSearchCustomerName]);
};
