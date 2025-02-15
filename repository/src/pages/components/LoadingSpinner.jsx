// LoadingSpinner.js
import React from "react";

const LoadingSpinner = () => {
  const spinnerStyle = {
    border: "8px solid #f3f3f3", /* Light grey */
    borderTop: "8px solid #003566", /* Blue */
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 2s linear infinite",
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;