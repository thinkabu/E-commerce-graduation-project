import React from "react";
import { Navigate } from "react-router-dom";

const Login: React.FC = () => {
  // TODO: Implement real login form + JWT auth
  // Tạm thời redirect thẳng về dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Login;
