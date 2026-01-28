import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
            setUser(userInfo);
            // If user is logged in and tries to access login/signup, redirect to chats
            if (location.pathname === "/" || location.pathname === "/signup") {
                navigate("/chats");
            }
        } else if (location.pathname !== "/signup") {
            // If no user and not on signup, must be on login
            navigate("/");
        }
    }, [navigate, location.pathname]);

    const login = (data) => {
        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data);
        navigate("/chats");
    };

    const logout = () => {
        localStorage.removeItem("userInfo");
        setUser(null);
        navigate("/");
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
