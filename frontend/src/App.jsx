import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DataTableProvider from "./Contexts/DataTableContext";
import SlicUserLogin from "./Pages/MemberLogin/SlicUserLogin/SlicUserLogin.jsx";
import GtinManagement from "./Pages/SlicPages/GtinManagement/GtinManagement.jsx";
import GTIN from "./Pages/SlicPages/GTIN/GTIN.jsx";
import UserProfile from "./Pages/SlicPages/UserProfile/UserProfile.jsx";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import SlicUserSignUp from "./Pages/MemberLogin/SlicUserSignUp/SlicUserSignUp.jsx";

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
              </Routes>
            </QueryClientProvider>
          </BrowserRouter>
        </div>
      </DataTableProvider>
    </>
  );
};

export default App;
