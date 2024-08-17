import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DataProvider } from './Contexts/DataContext';
// import { queryCache } from './utils/reactQuery.jsx'
// import { ReactQueryCacheProvider } from 'react-query'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <ReactQueryCacheProvider queryCache={queryCache}> */}
    <DataProvider>
    <App />
    </DataProvider>

    {/* </ReactQueryCacheProvider> */}
  </React.StrictMode>
);
