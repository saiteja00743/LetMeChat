import axios from "axios";

const API = axios.create({
    baseURL: "http://10.75.221.145:5000/api",
});

API.interceptors.request.use((req) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
        req.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return req;
});

export default API;
