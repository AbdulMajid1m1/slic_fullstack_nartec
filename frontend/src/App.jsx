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
import Users from "./Pages/SlicPages/MasterData/Users/Users.jsx";
import SlicFirstScreen from "./Pages/MemberLogin/SlicUserLogin/SlicFirstScreen.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Roles from "./Pages/SlicPages/MasterData/Roles/Roles.jsx";
import RolesProvider from "./Contexts/FetchRolesContext.jsx";
import TransactionCodes from "./Pages/SlicPages/MasterData/TransactionCodes/TransactionCodes.jsx";
import CustomerCodes from "./Pages/SlicPages/MasterData/CustomerCodes/CustomerCodes.jsx";
import PosHistory from "./Pages/SlicPages/PosHistory/PosHistory.jsx";

const queryClient = new QueryClient();

const App = () => {
  return (
    <>
      <DataTableProvider>
      <RolesProvider>
        <div>
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              <Routes>
                <Route path="/" element={<SlicFirstScreen />} />
                <Route path="/user-login" element={<SlicUserLogin />} />
                <Route path="slic-signup" element={<SlicUserSignUp />} />

                <Route path="gtin-management" element={<GtinManagement />} />
                <Route
                  path="gtin"
                  element={
                    <ProtectedRoute requiredRoles="Products">
                      <GTIN />
                    </ProtectedRoute>
                  }
                />
                {/* <Route path="gtin" element={<GTIN />} /> */}
                <Route
                  path="user-profile"
                  element={
                    <ProtectedRoute requiredRoles="user_profile">
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                {/* <Route path="user-profile" element={<UserProfile />} /> */}
                {/* <Route
                  path="pos"
                  element={
                    <ProtectedRoute requiredRoles="point_of_sale">
                      <POS />
                    </ProtectedRoute>
                  }
                /> */}
                <Route path="pos" element={<POS />} />
                <Route path="pos-history" element={<PosHistory />} />
                <Route
                  path="purchase-order"
                  element={
                    <ProtectedRoute requiredRoles="purchase_order">
                      <PurchaseOrder />
                    </ProtectedRoute>
                  }
                />
                {/* <Route path="purchase-order" element={<PurchaseOrder />} /> */}
                <Route
                  path="sales-order"
                  element={
                    <ProtectedRoute requiredRoles="sales_order">
                      <SalesOrder />
                    </ProtectedRoute>
                  }
                />
                {/* <Route path="sales-order" element={<SalesOrder />} /> */}
                {/* <Route path="direct-invoice" element={<DirectInvoice />} /> */}
                <Route
                  path="users"
                  element={
                    <ProtectedRoute requiredRoles="users">
                      <Users />
                    </ProtectedRoute>
                  }
                />
                {/* <Route path="users" element={<Users />} /> */}
                <Route
                  path="roles"
                  element={
                    <ProtectedRoute requiredRoles="Roles">
                      <Roles />
                    </ProtectedRoute>
                  }
                />
                {/* <Route path="roles" element={<Roles />} /> */}
                {/* <Route path="transaction-codes" element={<TransactionCodes />} /> */}
                <Route
                  path="transaction-codes"
                  element={
                    <ProtectedRoute requiredRoles="transaction_codes">
                      <TransactionCodes />
                    </ProtectedRoute>
                  }
                />
                {/* <Route path="customer-codes" element={<CustomerCodes />} /> */}
                <Route
                  path="customer-codes"
                  element={
                    <ProtectedRoute requiredRoles="customer_codes">
                      <CustomerCodes />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </QueryClientProvider>
          </BrowserRouter>
        </div>
        </RolesProvider>
      </DataTableProvider>
    </>
  );
};

export default App;
