import { useLoaderData, Outlet, Await } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "../hooks/useAuth";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";

type UserLoadType = {
  userPromise: Promise<unknown>;
};

export type UserDataType = {
  country: string;
  createdAt: string;
  email: string;
  entityType: string;
  entityValue: string;
  introduction: string;
  isAuth: string;
  profileImage: string;
  id: string;
  followerCount: number;
  followingCount: number;
  tweetCount: number;
  favColor: string;
  entity: string;
  following: boolean;
  followed: boolean;
};

const AuthLayout = () => {
  const { userPromise } = useLoaderData() as UserLoadType;
  return (
    <Suspense fallback={<LinearProgress />}>
      <Await
        resolve={userPromise}
        errorElement={<Alert severity="error">Something went wrong!</Alert>}
        children={(user) => (
          <AuthProvider userLoginFlag={user[0]} inUserData={user[1]}>
            <Outlet />
          </AuthProvider>
        )}
      />
    </Suspense>
  );
};

export default AuthLayout;
