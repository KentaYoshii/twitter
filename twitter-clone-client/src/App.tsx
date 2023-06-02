import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  defer,
} from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/login/LoginPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AuthLayout from "./components/AuthLayout";
import HomeLayout from "./components/HomeLayout";
import ProtectedLayout from "./components/ProtectedLayout";
import FeedPage from "./pages/feed/FeedPage";
import ExplorePage from "./pages/explore/ExplorePage";
import { fetchUser } from "./utils/api/user.api";
import TweetDetailPage from "./components/TweetDetailPage";

const getUserData = () =>
  new Promise(async (resolve) => {
    const isLogin = window.localStorage.getItem("isLogin");
    const res = await fetchUser();
    resolve([isLogin, res]);
  });

// HomeLayout contains all pages that not-logged-in users can access
// ProtectedLayout contains all pages that logged-in users can access
export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={<AuthLayout />}
      loader={() => defer({ userPromise: getUserData() })}
    >
      <Route element={<HomeLayout />}>
        <Route path="/" element={<LoginPage />} />
      </Route>
      <Route path="/dashboard" element={<ProtectedLayout />}>
        <Route path="home" element={<HomePage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="profile/:handle" element={<ProfilePage /> } />
        <Route path=":id/status/:entityType" element={<TweetDetailPage/>}/>
      </Route>
    </Route>
  )
);

export default router;
