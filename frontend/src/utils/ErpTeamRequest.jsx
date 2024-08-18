
import axios from "axios";
import { baseUrl } from './config.jsx';

const ErpTeamRequest = axios.create({
    baseURL: baseUrl,
    // withCredentials: true,
});

export default ErpTeamRequest;