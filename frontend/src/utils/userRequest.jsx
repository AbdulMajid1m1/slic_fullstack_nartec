
import axios from "axios";
import { baseUrl } from './config.jsx';
const memberDataString = sessionStorage.getItem('slicUserData');
const getToken = JSON.parse(memberDataString);
console.log(getToken)

const newRequest = axios.create({
    baseURL: baseUrl,
    // withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken?.data?.token}`,
    }

});

export default newRequest;