import { getSKForTweet } from "../helpers/util";
import { ImageEntity } from "./ImageEntity";
import { UserEntity } from "./UserEntity";

export interface TweetEntity {
  id: string; // pk
  entityType: string; // sk
  entityValue: string; // gsi1-pk
  userName: string;
  content: string;
  createdAt: string;
  profileImage: string;
  entity: string;
  isEdited: boolean;
  images: string[];
  likeCount: number;
  likedBy: Set<string>;
  doILike: boolean;
  comments: Comment[];
  commentCount: number;
}

export interface Comment {
  tweetPK: string;
  tweetSK: string;
  posterPK: string;
  posterSK: string;
  profileImage: string; // of the commenter
  posterName: string; // of the commenter
  createdAt: string;
  content: string;
}

export const newComment = (
  tweetPK: string,
  tweetSK: string,
  posterPK: string,
  posterSK: string,
  profileImage: string, // of the commenter
  posterName: string, // of the commenter
  content: string,
) => ({
    tweetPK,
    tweetSK,
    posterPK,
    posterSK,
    profileImage, // of the commenter
    posterName, // of the commenter
    createdAt: Date.now().toString(),
    content,
  } as Comment);

// Create and return a new UserEntity from UserToken
export const createNewTweet = (
  usr: UserEntity,
  content: string,
  imageEntities: ImageEntity[],
): TweetEntity => {
  const { id, profileImage } = usr;
  const createdAt = Date.now().toString();
  const entityType = getSKForTweet(createdAt, usr.entityValue);
  const entityValue = entityType;
  const userName = usr.entityValue;
  const entity = "tweet";
  const isEdited = false;
  const images = imageEntities.map((imageE) => imageE.key);
  const likeCount = 0;
  const likedBy = new Set<string>(["empty"]);
  const doILike = false;
  const comments: Comment[] = [];
  const commentCount = 0;
  return {
    id,
    entityType,
    userName,
    entityValue,
    createdAt,
    content,
    profileImage,
    entity,
    isEdited,
    images,
    likeCount,
    likedBy,
    doILike,
    comments,
    commentCount,
  };
};
