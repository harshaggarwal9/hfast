import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.withCredentials = true; // ✅ enable cookies for all requests

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true } // ✅ important for cookies
      );
      const { user } = response.data;
      set({ user, loading: false });
      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Login failed",
        loading: false,
      });
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  },

  signup: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        "/api/auth/signup",
        { name, email, password, role },
        { withCredentials: true }
      );
      const { user } = response.data;
      set({ user, loading: false });
      toast.success("Signup successful, waiting for admin approval");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Signup failed",
        loading: false,
      });
      toast.error(error.response?.data?.message || "Signup failed");
    }
  },

  logout: async () => {
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      set({ user: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  },
  loadUser: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/api/auth/profile", {
        withCredentials: true,
      });
      set({ user: response.data, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
      console.error("User load failed:", error);
    }
  },
}));
export default useAuthStore;
