import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear token from both storages
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    // Redirect to login page
    navigate("/signin");
  }, [navigate]);

  return null;
}