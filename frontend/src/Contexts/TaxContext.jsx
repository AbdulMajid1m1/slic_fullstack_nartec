// TaxContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import newRequest from '../utils/userRequest';

const TaxContext = createContext();

export const TaxProvider = ({ children }) => {
  const [taxAmount, setTaxAmount] = useState(null);
  const memberDataString = sessionStorage.getItem('slicUserData');
  const memberData = JSON.parse(memberDataString);

  const fetchTaxAmount = async () => {
    try {
      const response = await newRequest.get("/invoice/v1/getTaxRecords", {
        headers: {
          Authorization: `Bearer ${memberData?.data?.token}`,
        },
      });
      setTaxAmount(response?.data[0]?.taxAmount || 0);
    } catch (error) {
      console.error('Error fetching tax amount:', error);
    }
  };

  const updateTaxAmount = (newTaxAmount) => {
    setTaxAmount(newTaxAmount);
  };

  useEffect(() => {
    fetchTaxAmount();
  }, [memberData]);

  return (
    <TaxContext.Provider value={{ taxAmount, setTaxAmount, updateTaxAmount }}>
      {children}
    </TaxContext.Provider>
  );
};

export const useTaxContext = () => useContext(TaxContext);
