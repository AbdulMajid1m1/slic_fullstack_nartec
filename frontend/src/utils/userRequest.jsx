
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

const newRequest = axios.create({
    baseURL: baseUrl,
    // withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
});

// Dynamically set the token for each request
newRequest.interceptors.request.use((config) => {
    const memberDataString = sessionStorage.getItem('slicUserData');
    const getToken = JSON.parse(memberDataString);
    // console.log(getToken);
    if (getToken?.data?.token) {
        config.headers.Authorization = `Bearer ${getToken.data.token}`;
    }
    return config;
});

export default newRequest;
