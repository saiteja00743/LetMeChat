import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { MessageSquare, Lock, Mail, User, Loader2, Camera } from "lucide-react";
import { motion } from "framer-motion";

import { GoogleLogin } from "@react-oauth/google";

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        avatar: "",
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const { data } = await API.post("/user/google", {
                token: credentialResponse.credential,
            });
            toast.success("Account created successfully");
            login(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Google Signup Failed");
        } finally {
            setLoading(false);
        }
    };

    const postDetails = async (pics) => {
        setLoading(true);
        if (pics === undefined) {
            toast.error("Please select an image");
            setLoading(false);
            return;
        }

        if (pics.type === "image/jpeg" || pics.type === "image/png" || pics.type === "image/webp") {
            const data = new FormData();
            data.append("file", pics);

            try {
                // Use our backend upload route
                const response = await API.post("/upload", data, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                setFormData({ ...formData, avatar: response.data.url });
                setLoading(false);
                toast.success("Image uploaded successfully");
            } catch (error) {
                console.error("Upload Error:", error);
                setLoading(false);
                toast.error(error.response?.data?.message || "Upload failed");
            }
        } else {
            toast.error("Please select a JPEG, PNG or WebP image");
            setLoading(false);
            return;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await API.post("/user", formData);
            toast.success("Account created successfully");
            login(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md rounded-2xl p-8 shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors duration-300"
            >
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                        <MessageSquare size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</h1>
                    <p className="text-slate-500 dark:text-slate-400">Join our community today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-500" size={20} />
                            <input
                                type="text"
                                required
                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 pl-10 pr-4 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
                            <input
                                type="email"
                                required
                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 pl-10 pr-4 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 pl-10 pr-4 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Minimum 6 characters required</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Picture</label>
                        <div className="relative">
                            <Camera className="absolute left-3 top-3 text-slate-500" size={20} />
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 pl-10 pr-4 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm file:mr-4 file:py-0.5 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 text-slate-900 dark:text-white"
                                onChange={(e) => postDetails(e.target.files[0])}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/30"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
                    </button>
                </form>

                <div className="mt-6 flex flex-col gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="flex justify-center w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error("Google Signup Failed")}
                            theme="filled_blue"
                            shape="pill"
                            width="100%"
                            text="signup_with"
                        />
                    </div>
                </div>

                <p className="mt-6 text-center text-slate-500 dark:text-slate-400">
                    Already have an account?{" "}
                    <Link to="/" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default SignupPage;
