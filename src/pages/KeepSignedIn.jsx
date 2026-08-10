import { Navigate, Outlet } from "react-router-dom";

function KeepSignedIn() {
  const token = localStorage.getItem("token");
  if (token != null) {
    return <Navigate to="/index" />;
  } else {
    return <Outlet />;
  }
}

export default KeepSignedIn;
