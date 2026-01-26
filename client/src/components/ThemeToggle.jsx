import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm border border-slate-300 dark:border-slate-700"
            aria-label="Toggle Theme"
        >
            {isDarkMode ? (
                <Sun size={20} className="text-yellow-400 fill-yellow-400/20" />
            ) : (
                <Moon size={20} className="text-blue-600 fill-blue-600/10" />
            )}
        </button>
    );
};

export default ThemeToggle;
