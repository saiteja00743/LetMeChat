import axios from "axios";

const API = axios.create({
    baseURL: "https://web-production-beedf.up.railway.app/api",
});

API.interceptors.request.use((req) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
        req.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return req;
});

export default API;
