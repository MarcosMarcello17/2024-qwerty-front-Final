import AchievementsPage from "@/pages/AchievementsPage";
import BudgetPage from "@/pages/BudgetPage";
import CategoryPage from "@/pages/CategoryPage";
import ChangePasswordForm from "@/pages/ChangePasswordForm";
import ForgotPasswordForm from "@/pages/ForgotPasswordForm";
import GroupsPage from "@/pages/GroupsPage";
import IndexPage from "@/pages/Index";
import KeepSignedIn from "@/pages/KeepSignedIn";
import LoginForm from "@/pages/LoginForm";
import PaymentsPage from "@/pages/PaymentsPage";
import PrivateRoutes from "@/pages/PrivateRoutes";
import ProfilePage from "@/pages/ProfilePage";
import RegisterForm from "@/pages/RegisterForm";
import ResetPasswordForm from "@/pages/ResetPasswordForm";
import TransactionsPage from "@/pages/TransactionsPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function PageRoutes() {
  return (
    <Router>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route exact path="/index" element={<IndexPage />} />
          <Route
            exact
            path="/change-password"
            element={<ChangePasswordForm />}
          />
          <Route exact path="/pagos" element={<PaymentsPage />} />
          <Route exact path="/profile" element={<ProfilePage />} />
          <Route exact path="/presupuestos" element={<BudgetPage />} />
          <Route exact path="/achievements" element={<AchievementsPage />} />
          <Route exact path="/transacciones" element={<TransactionsPage />} />
          <Route exact path="/categorias" element={<CategoryPage />} />
          <Route exact path="/grupos" element={<GroupsPage />} />
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
