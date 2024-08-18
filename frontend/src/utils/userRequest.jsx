
// import axios from "axios";
// import { baseUrl } from './config.jsx';
// const memberDataString = sessionStorage.getItem('slicUserData');
// const getToken = JSON.parse(memberDataString);
// console.log(getToken)

// const newRequest = axios.create({
//     baseURL: baseUrl,
//     // withCredentials: true,
//     headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${getToken?.data?.token}`,
//     }

// });

// export default newRequest;


import axios from "axios";
import { baseUrl } from './config.jsx';

// Create the Axios instance
const newRequest = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// Use Axios request interceptor to set Authorization header dynamically
newRequest.interceptors.request.use((config) => {
    const memberDataString = sessionStorage.getItem('slicUserData');
    const getToken = JSON.parse(memberDataString);

    if (getToken?.data?.token) {
        config.headers.Authorization = `Bearer ${getToken.data.token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default newRequest;
