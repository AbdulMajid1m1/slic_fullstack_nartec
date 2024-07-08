
import axios from "axios";
import { baseUrl } from './config.jsx';

const newRequest = axios.create({
    baseURL: baseUrl,
    // withCredentials: true,

});

export default newRequest;