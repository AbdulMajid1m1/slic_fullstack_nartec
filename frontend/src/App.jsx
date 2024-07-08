import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DataTableProvider from "./Contexts/DataTableContext";
import MemberLogin from "./Pages/MemberLogin/EmailAddress/MemberLogin.jsx";
import GtinManagement from "./Pages/SlicPages/GtinManagement/GtinManagement.jsx";
import GTIN from "./Pages/SlicPages/GTIN/GTIN.jsx";
import UserProfile from "./Pages/SlicPages/UserProfile/UserProfile.jsx";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

const queryClient = new QueryClient();

const App = () => {
  return (
    <>
      <DataTableProvider>
        <div>
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              <Routes>
                <Route path="/" element={<MemberLogin />} />
                <Route path="gtin-management" element={<GtinManagement />} />
                <Route path="gtin" element={<GTIN />} />
                <Route path="user-profile" element={<UserProfile />} />
              </Routes>
            </QueryClientProvider>
          </BrowserRouter>
        </div>
      </DataTableProvider>
    </>
  );
};

export default App;
