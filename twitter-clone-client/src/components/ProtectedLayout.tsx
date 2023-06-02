import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import ResponsiveAppBar from "./Appbar";
import Footer from "./Footer";

const pages = ["Home", "Explore", "Profile", "Feed"];
// List of PROTECTED paths (you need to be logged in to be able to view these pages)
const paths = [
  "/dashboard/home",
  "/dashboard/explore",
  "/dashboard/profile/me",
  "/dashboard/feed",
];

const ProtectedLayout = () => {
  const userAuth = useAuth();

  useEffect(() => {
    if (!userAuth.isLogin || !userAuth.userData) {
      userAuth.setIsLogin(false);
      userAuth.setUserData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // User not logged in, send them back to home login page
  if (!userAuth.isLogin || !userAuth.userData) {
    return <Navigate to={"/"} />;
  }

  // If user logged in, then display protected domains
  return (
    <div>
      <div>
        <ResponsiveAppBar pages={pages} paths={paths} />
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default ProtectedLayout;
