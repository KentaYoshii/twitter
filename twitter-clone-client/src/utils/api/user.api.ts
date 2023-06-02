import axios from "axios";
import { UserDataType } from "../../components/AuthLayout";

export type UpdateUserBodyType = {
  favColor: string;
  country: string;
  introduction: string;
};

export const fetchOtherUsers = async (): Promise<null | UserDataType[]> => {
  try {
    const res = await axios.get("/user", { withCredentials: true });
    const data = res.data;
    return data;
  } catch {
    return null;
  }
};

export const fetchOtherUser = async (
  handle: string
): Promise<null | UserDataType> => {
  try {
    const res = await axios.get(`/user/${handle}`, { withCredentials: true });
    return res.data;
  } catch {
    return null;
  }
};

export const fetchUser = async (): Promise<null | UserDataType> => {
  try {
    const res = await axios.get("/user/me", { withCredentials: true });
    const data = res.data;
    return data.location ? null : data;
  } catch {
    return null;
  }
};

export const updateMe = async (
  updateWith: UpdateUserBodyType
): Promise<null | UserDataType> => {
  try {
    const res = await axios.post("/user/me", updateWith, {
      withCredentials: true,
    });
    return res.data;
  } catch {
    return null;
  }
};

export const followUser = async (follow: UserDataType) => {
  try {
    const res = await axios.post(
      "/follow",
      { followingUserId: follow.id },
      { withCredentials: true }
    );
    return res.status === 200;
  } catch {
    return null;
  }
};

export const unFollowUser = async (unfollow: UserDataType) => {
  try {
    const res = await axios.delete("/follow", {
      data: {
        unFollowingUserId: unfollow.id,
      },
      withCredentials: true,
    });
    return res.status === 200;
  } catch {
    return null;
  }
};
