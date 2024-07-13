import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DataTableProvider from "./Contexts/DataTableContext";
import SlicUserLogin from "./Pages/MemberLogin/SlicUserLogin/SlicUserLogin.jsx";
import GtinManagement from "./Pages/SlicPages/GtinManagement/GtinManagement.jsx";
import GTIN from "./Pages/SlicPages/GTIN/GTIN.jsx";
import UserProfile from "./Pages/SlicPages/UserProfile/UserProfile.jsx";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import SlicUserSignUp from "./Pages/MemberLogin/SlicUserSignUp/SlicUserSignUp.jsx";
import POS from "./Pages/SlicPages/POS/POS.jsx";
import PurchaseOrder from "./Pages/SlicPages/PurchaseOrder/PurchaseOrder.jsx";
import SalesOrder from "./Pages/SlicPages/SalesOrder/SalesOrder.jsx";
import DirectInvoice from "./Pages/SlicPages/DirectInvoice/DirectInvoice.jsx";

const queryClient = new QueryClient();

const App = () => {
  return (
    <>
      <DataTableProvider>
        <div>
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              <Routes>
                <Route path="/" element={<SlicUserLogin />} />
                <Route path="slic-signup" element={<SlicUserSignUp />} />
                <Route path="gtin-management" element={<GtinManagement />} />
                <Route path="gtin" element={<GTIN />} />
                <Route path="user-profile" element={<UserProfile />} />
                <Route path="pos" element={<POS />} />
                <Route path="purchase-order" element={<PurchaseOrder />} />
                <Route path="sales-order" element={<SalesOrder />} />
                <Route path="direct-invoice" element={<DirectInvoice />} />
              </Routes>
            </QueryClientProvider>
          </BrowserRouter>
        </div>
      </DataTableProvider>
    </>
  );
};

export default App;
