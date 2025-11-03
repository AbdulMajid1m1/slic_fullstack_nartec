import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import SupplierLogin from "./pages/SupplierLogin/SupplierLogin";
import Layout from "./components/layout/layout";
import VisitorDirectory from "./pages/VisitorDirectory/VisitorDirectory";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateAccount from "./pages/CreateAccount/CreateAccount";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  return (
    <div>
      <BrowserRouter>
       <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Login route - no layout */}
          <Route path="/" element={<SupplierLogin />} />
          <Route path="/create-account" element={<CreateAccount />} />
          
          <Route path="/dashboard" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />

          <Route path="/visitor-directory" element={
            <Layout>
              <VisitorDirectory />
            </Layout>
          } />
        </Routes>
       </QueryClientProvider>
      </BrowserRouter>
    </div>
  );
};

export default App;