import { useEffect } from "react";
import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ResponsiveAppBar from "./Appbar";

const pages: Array<string> = [];
// List of NON-PROTECTED Paths (no need to be logged in to view these pages)
const paths: Array<string> = [];

const HomeLayout = () => {
  const userAuth = useAuth();

  // Parse the URI for sub and name query params
  const [searchParams] = useSearchParams();
  const auth = searchParams.get("auth");

  useEffect(() => {
    // If this is true, make another request to fetch user information
    if (auth === "ok") {
      userAuth.setIsLogin(true);
    } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Valid Login State
  // isLogin is set && userData is set (server agrees that user is logged in)
  if (userAuth.isLogin && userAuth.userData) {
    return <Navigate to="/dashboard/home" />;
  } else {
    window.localStorage.setItem("isLogin", "false");
  }
  
  return (
    <div>
      <ResponsiveAppBar pages={pages} paths={paths} />
      <Outlet />
    </div>
  );
};

export default HomeLayout;
