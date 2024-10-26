import "./App.css";
import HomePage from "./pages/HomePage";
import RegisterForm from "./pages/RegisterForm";
import LoginForm from "./pages/LoginForm";
import ChangePasswordForm from "./pages/ChangePasswordForm";
import ForgotPasswordForm from "./pages/ForgotPasswordForm";
import ResetPasswordForm from "./pages/ResetPasswordForm";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoutes from "./pages/PrivateRoutes";
import KeepSignedIn from "./pages/KeepSignedIn";
import ProfilePage from "./pages/ProfilePage";
import BudgetPage from "./pages/BudgetPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route exact path="/index" element={<HomePage />} />
          <Route
            exact
            path="/change-password"
            element={<ChangePasswordForm />}
          />
          <Route exact path="/profile" element={<ProfilePage />} />
          <Route exact path="/presupuestos" element={<BudgetPage />} />
        </Route>
        <Route element={<KeepSignedIn />}>
          <Route exact path="/" element={<LoginForm />} />
        </Route>
        <Route exact path="/reset-password" element={<ResetPasswordForm />} />
        <Route exact path="/register" element={<RegisterForm />} />
        <Route exact path="/forgot-password" element={<ForgotPasswordForm />} />
      </Routes>
    </Router>
  );
}

export default App;
