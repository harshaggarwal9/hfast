import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, user } = response.data;
      set({ user, token, loading: false });
      if (user && token) {
        toast.success("Logged in successfully");
      }
      localStorage.setItem('token', token);
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        loading: false,
      });
      toast.error(error.response?.data?.message || "Login failed");
    }
  },

  // ✅ Add comma here
  signup: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/auth/signup', {
        name,
        email,
        password,
        role,
      });
      const { token, user } = response.data;
      set({ user, token, loading: false });
      localStorage.setItem('token', token);
      toast.success("Signup successful");
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Signup failed',
        loading: false,
      });
      toast.error(error.response?.data?.message || "Signup failed");
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
    toast.success("Logged out successfully");
  },
}));

export default useAuthStore;
