import { createContext, useContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  removeToken,
  saveToken,
} from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const token = localStorage.getItem("nxtgensec_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getCurrentUser();
      setUser(data.user);
    } catch (error) {
      console.error("Authentication check failed:", error);
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function login(email, password) {
    const data = await loginUser({
      email,
      password,
    });

    if (!data.token) {
      throw new Error(
        "Login succeeded but the server did not return an authentication token."
      );
    }

    saveToken(data.token);
    setUser(data.user);

    return data;
  }

  async function register(username, email, password) {
    return registerUser({
      username,
      email,
      password,
    });
  }

  function logout() {
    removeToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}