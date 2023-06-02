import { createContext, useContext, FC, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { UserDataType } from "../components/AuthLayout";
import { Comment } from "../components/TweetDetailPage";
const AuthContext = createContext<UserAuthType | null>(null);

// Our Context variables
export type UserAuthType = {
    isLogin: boolean;
    setIsLogin: (data: boolean) => void;
    userData: UserDataType | null;
    setUserData: (data: UserDataType | null) => void;
}

export interface TweetEntity {
    id: string; // pk
    entityType: string;
    entityValue: string;
    userName: string;
    content: string;
    createdAt: string;
    profileImage: string;
    entity: string;
    isEdited: boolean;
    doILike: boolean;
    likeCount: number;
    images: string[];
    comments: Comment[];
    commentCount: number;
  }

interface Props {
    children: React.ReactNode;
    userLoginFlag: boolean;
    inUserData: UserDataType;
}

export const AuthProvider: FC<Props> = ({ children, userLoginFlag, inUserData }) => {
    const [isLogin, setIsLogin] = useLocalStorage<boolean>("isLogin", userLoginFlag);
    const [userData, setUserData] = useState<UserDataType | null>(inUserData);
    const value = {
        isLogin, setIsLogin,
        userData, setUserData,
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContextWrapper();
}

const useContextWrapper = () => {
    const res = useContext(AuthContext);
    if (!res) {
        throw Error("Context is null");
    }
    return res;
}