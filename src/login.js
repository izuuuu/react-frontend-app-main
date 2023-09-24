import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

function Login() {
  const Navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const initiateAuthorization = () => {
    window.location.href = "http://localhost:5000/authorize";
  };

//   const handleAuthentication = () => {
//     setTimeout(() => {
//       setIsAuthenticated(true);
//       Navigate.push("/dashboard");
//     }, 2000);
//   };
//   useEffect(() => {
//     setIsAuthenticated(true);
//     Navigate.push("/dashboard");
//   }, []);
  return (
    <div className="login-container">
      <h2>Login to Actionstep</h2>
      <button onClick={initiateAuthorization}>
        Authorize with Actionstep
      </button>
    </div>
  );
}

export default Login;
