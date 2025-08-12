// Utility to create API calls with automatic token expiration handling
import { useAuth } from "../auth/AuthContext";

export const useApi = () => {
  const { authenticatedFetch } = useAuth();

  const apiCall = async (url, options = {}) => {
    const defaultOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    try {
      const response = await authenticatedFetch(url, defaultOptions);
      return response;
    } catch (error) {
      if (error.message === "Session expired") {
        // This will be handled by the TokenExpirationHandler
        throw error;
      }
      throw error;
    }
  };

  return { apiCall };
};

// Direct function for cases where useAuth hook can't be used
export const createAuthenticatedFetch = (authenticatedFetch) => {
  return async (url, options = {}) => {
    const defaultOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    try {
      const response = await authenticatedFetch(url, defaultOptions);
      return response;
    } catch (error) {
      if (error.message === "Session expired") {
        throw error;
      }
      throw error;
    }
  };
};
