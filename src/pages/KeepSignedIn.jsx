import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

function KeepSignedIn() {
  const notToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXJjb3NtYXJjZWxsb0B1Y2EuZWR1LmFyIiwiaWF0IjoxNzI2NTg2MDg0LCJleHAiOjE3MjY1ODk2ODR9.lbLkXhovxs7wqTnmTXtykXdRl0xFOJsVt4ctIlBsrzU";
  const token = localStorage.getItem("token");
    if (token != null && token != notToken){
      return(<Navigate to="/index"/>);
    }else{
      return(
        <Outlet/>
      );
    }
}

export default KeepSignedIn