import { UserToken } from "../oidc";
import { getPKFromSub, getSKFromUserName } from "../helpers/util";

export interface UserEntity {
  id: string;
  entityType: string;
  entityValue: string;
  createdAt: string;
  email: string;
  profileImage: string;
  profileImageUpdated: boolean;
  introduction: string;
  country: string;
  followerCount: number;
  followingCount: number;
  tweetCount: number;
  favColor: string;
  entity: string;
  following: boolean; // from the logged in user's pov
  followed: boolean; // from the logged in user's pov
}

// Create and return a new UserEntity from UserToken
export const createNewUser = (user: UserToken): UserEntity => {
  const id = getPKFromSub(user.sub);
  const entityType = getSKFromUserName(user.name, user.sub, true); // SK
  const entityValue = user.name;
  const createdAt = Date.now().toString();
  const { email } = user;
  const profileImage = user.picture;
  const profileImageUpdated = false;
  const introduction = "";
  const country = "";
  const followerCount = 0;
  const followingCount = 0;
  const tweetCount = 0;
  const favColor = "";
  const entity = "User";
  const following = false;
  const followed = false;
  return {
    id,
    entityType,
    entityValue,
    createdAt,
    email,
    profileImage,
    profileImageUpdated,
    introduction,
    country,
    followerCount,
    followingCount,
    tweetCount,
    favColor,
    entity,
    following,
    followed,
  };
};
