import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook to manage authentication state and token validation
 * @param {number} interval - Interval in milliseconds to check token validity (default: 5 minutes)
 * @returns {Object} Authentication state and functions
 */
export function useAuth(interval = 5 * 60 * 1000) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthExpiredNotification, setShowAuthExpiredNotification] =
    useState(false);
  const navigate = useNavigate();

  // Function to check if the token is valid
  const checkIfValidToken = async (token) => {
    if (!token) return false;

    try {
      const response = await fetch(
        "https://two024-qwerty-back-final-marcello.onrender.com/api/transacciones/userTest",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        return false;
      }
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      return false;
    }
  };

  // Initial check when component mounts
  useEffect(() => {
    const validateToken = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const isValid = await checkIfValidToken(token);

      if (!isValid) {
        setShowAuthExpiredNotification(true);
        setTimeout(() => {
          navigate("/");
        }, 3000); // Give user 3 seconds to see notification before redirect
      }

      setIsLoading(false);
    };

    validateToken();
  }, [navigate]);

  // Set up periodic token validation
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      navigate("/");
      return;
    }

    // Check token initially
    checkIfValidToken(token);

    // Set up interval to check token periodically
    const intervalId = setInterval(async () => {
      const currentToken = localStorage.getItem("token");
      const isValid = await checkIfValidToken(currentToken);

      if (!isValid) {
        setShowAuthExpiredNotification(true);
        setTimeout(() => {
          navigate("/");
        }, 3000); // Give user 3 seconds to see notification before redirect
      }
    }, interval);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate, interval]);

  return {
    isAuthenticated,
    isLoading,
    showAuthExpiredNotification,
    setShowAuthExpiredNotification,
    checkIfValidToken,
  };
}
