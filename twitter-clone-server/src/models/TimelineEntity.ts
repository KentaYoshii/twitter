import { getEntityValueForTimeline, getSKForTimeline } from "../helpers/util";
import { TweetEntity } from "./TweetEntity";

export interface Timeline {
  // for this user
  id: string;
  entityType: string, // Timeline-<timestamp>-userName
  entityValue: string, 
  posterId: string,
  tweetEntityType: string,
  userName: string,  // poster
  content: string,
  createdAt: string,
  profileImage: string,
  entity: string,
  isEdited: boolean,
  images: string[],
  doILike: boolean,
  likeCount: number,
  likedBy: Set<string>,
  commentCount: number,
} 

export const createNewTimeline = (forUser: string, poster: string, tweet: TweetEntity): Timeline => {
  const id = forUser; 
  const posterId = poster;
  const { profileImage, createdAt, userName, content, images, likeCount, likedBy, commentCount } = tweet;
  const entityType = getSKForTimeline(createdAt, poster);
  const entityValue = getEntityValueForTimeline(createdAt, poster);
  const entity = "Timeline";
  const isEdited = false;
  const doILike = false;
  const tweetEntityType = tweet.entityType
  return {
    id, 
    entityType, 
    userName,
    posterId,
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
    tweetEntityType,
    commentCount,
  };
};