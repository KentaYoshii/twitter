import {
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  DeleteCommand,
  DeleteCommandInput,
  UpdateCommand,
  QueryCommandOutput,
  DeleteCommandOutput,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { documentClient } from "./db_init";
import config from "../config";
import { Comment, TweetEntity, createNewTweet } from "../models/TweetEntity";
import { getUserByPK } from "./db_user";
import { getSKFromUserName } from "../helpers/util";
import { Timeline } from "../models/TimelineEntity";
import { ImageEntity } from "../models/ImageEntity";
import { createPresignedUrl } from "../storage/s3_action";

export const fillDoILikeTweets = (pk: string, tweets: TweetEntity[]) =>
  tweets.map((tweet) => {
    const cp = { ...tweet };
    const { likedBy } = tweet;
    if (!likedBy.has(pk)) {
      cp.doILike = false;
      return cp;
    }
    cp.doILike = true;
    return cp;
  });

export const signImagesForTweet = async (tweet: TweetEntity) => {
  const { images } = tweet;
  const imagesPromise = images.map((image) => createPresignedUrl(image));
  try {
    const urls = await Promise.all(imagesPromise);
    const newTweet = { ...tweet };
    newTweet.images = urls;
    return newTweet;
  } catch {
    return null;
  }
};

export const signImagesForTweets = async (tweets: TweetEntity[]) => {
  const promises = await Promise.all(
    tweets.map((tweet) => signImagesForTweet(tweet)),
  );
  return promises;
};

export const signImagesForTimeline = async (tweet: Timeline) => {
  const { images } = tweet;
  const imagesPromise = images.map((image) => createPresignedUrl(image));
  try {
    const urls = await Promise.all(imagesPromise);
    const newTL = { ...tweet };
    newTL.images = urls;
    return newTL;
  } catch {
    return null;
  }
};

export const signImagesForTimelines = async (tweets: Timeline[]) => {
  const promises = await Promise.all(
    tweets.map((tweet) => signImagesForTimeline(tweet)),
  );
  return promises;
};

const getProfileImageForSingleTweet = async (
  tweet: TweetEntity,
  posterPK: string,
  posterSK: string,
) => {
  const user = await getUserByPK(posterPK, posterSK, true);
  const { profileImage } = user!;
  const newTweet = { ...tweet };
  newTweet.profileImage = profileImage;
  return newTweet;
};

// Create a Tweet
export const createTweet = async (
  content: string,
  images: ImageEntity[],
  pk: string,
  sk: string,
): Promise<TweetEntity | null> => {
  const user = await getUserByPK(pk, sk, false);
  if (!user) {
    return null;
  }
  // Create New Tweet
  const newTweet = createNewTweet(user, content, images);
  const params: PutCommandInput = {
    TableName: config.TABLE_NAME,
    Item: {
      // Req attr
      id: newTweet.id,
      entityType: newTweet.entityType,
      entityValue: newTweet.entityValue,
      // Twitter Entity Specific attr
      createdAt: newTweet.createdAt,
      userName: newTweet.userName,
      content: newTweet.content,
      entity: newTweet.entity,
      isEdited: newTweet.isEdited,
      images: newTweet.images,
      likeCount: newTweet.likeCount,
      likedBy: newTweet.likedBy,
      comments: newTweet.comments,
      commentCount: newTweet.commentCount,
    },
  };
  try {
    const cmd = new PutCommand(params);
    await documentClient.send(cmd);
    const retTweet = await getProfileImageForSingleTweet(newTweet, pk, sk);
    return retTweet;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const populateTweetsProfileImage = async (tweets: TweetEntity[]) => {
  const tweetsPromises = tweets.map((tweet) => {
    const pk = tweet.id;
    const sub = pk.split("-")[1];
    const sk = getSKFromUserName(tweet.userName, sub, true);
    return getProfileImageForSingleTweet(tweet, pk, sk);
  });
  try {
    return await Promise.all(tweetsPromises);
  } catch {
    return null;
  }
};

export const getOtherTweets = async (pk: string) => {
  const params: QueryCommandInput = {
    TableName: config.TABLE_NAME,
    IndexName: config.GSI1_NAME,
    KeyConditionExpression:
      "#entity = :entity and begins_with(#entityType, :tweet_entity)",
    FilterExpression: "#id <> :filterValue",
    ExpressionAttributeNames: {
      "#id": "id",
      "#entity": "entity",
      "#entityType": "entityType",
    },
    ExpressionAttributeValues: {
      ":entity": "tweet",
      ":tweet_entity": "Tweet",
      ":filterValue": pk,
    },
    ScanIndexForward: false,
  };
  try {
    const cmd = new QueryCommand(params);
    const res: QueryCommandOutput = await documentClient.send(cmd);
    let results = res.Items as TweetEntity[];
    results = fillDoILikeTweets(pk, results);
    const tweets = await populateTweetsProfileImage(results);
    if (!tweets) {
      return null;
    }
    tweets.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    const newTweets = await signImagesForTweets(tweets);
    return newTweets;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getTweets = async (pk: string) => {
  const params: QueryCommandInput = {
    TableName: config.TABLE_NAME,
    KeyConditionExpression:
      "#id = :user_pk and begins_with(#entityType, :tweet_entity)",
    ExpressionAttributeNames: {
      "#id": "id",
      "#entityType": "entityType",
    },
    ExpressionAttributeValues: {
      ":user_pk": pk,
      ":tweet_entity": "Tweet",
    },
    ScanIndexForward: false, // descending
  };
  try {
    const cmd = new QueryCommand(params);
    const res: QueryCommandOutput = await documentClient.send(cmd);
    return res.Items;
  } catch {
    return null;
  }
};

export const deleteTweet = async (pk: string, sk: string) => {
  const params: DeleteCommandInput = {
    TableName: config.TABLE_NAME,
    Key: {
      id: pk,
      entityType: sk,
    },
    ReturnValues: "ALL_OLD",
  };
  try {
    const cmd = new DeleteCommand(params);
    const res: DeleteCommandOutput = await documentClient.send(cmd);
    return res.Attributes as TweetEntity;
  } catch {
    return null;
  }
};

export const doUnLikeTweet = async (
  poster_pk: string,
  viewer_pk: string,
  sk: string,
) => {
  const cmd = new UpdateCommand({
    TableName: config.TABLE_NAME,
    Key: {
      id: poster_pk,
      entityType: sk,
    },
    UpdateExpression: "delete #likedBy :viewer",
    ExpressionAttributeNames: {
      "#likedBy": "likedBy",
    },
    ExpressionAttributeValues: {
      ":viewer": new Set<string>([viewer_pk]),
    },
    ReturnValues: "ALL_NEW",
  });
  const cmd2 = new UpdateCommand({
    TableName: config.TABLE_NAME,
    Key: {
      id: poster_pk,
      entityType: sk,
    },
    UpdateExpression: "set #likeCount = #likeCount + :incr",
    ExpressionAttributeNames: {
      "#likeCount": "likeCount",
    },
    ExpressionAttributeValues: {
      ":incr": -1,
    },
    ReturnValues: "ALL_NEW",
  });
  try {
    await documentClient.send(cmd);
    const result = await documentClient.send(cmd2);
    const response = result.Attributes as TweetEntity;
    const sub = response.id.split("-")[1];
    const updatedTweet = await getProfileImageForSingleTweet(
      response,
      response.id,
      getSKFromUserName(response.userName, sub, true),
    );
    return updatedTweet;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const doLikeTweet = async (
  poster_pk: string,
  viewer_pk: string,
  sk: string,
) => {
  const cmd = new UpdateCommand({
    TableName: config.TABLE_NAME,
    Key: {
      id: poster_pk,
      entityType: sk,
    },
    UpdateExpression: "add #likedBy :viewer",
    ExpressionAttributeNames: {
      "#likedBy": "likedBy",
    },
    ExpressionAttributeValues: {
      ":viewer": new Set<string>([viewer_pk]),
    },
    ReturnValues: "ALL_NEW",
  });
  const cmd2 = new UpdateCommand({
    TableName: config.TABLE_NAME,
    Key: {
      id: poster_pk,
      entityType: sk,
    },
    UpdateExpression: "set #likeCount = #likeCount + :incr",
    ExpressionAttributeNames: {
      "#likeCount": "likeCount",
    },
    ExpressionAttributeValues: {
      ":incr": 1,
    },
    ReturnValues: "ALL_NEW",
  });
  try {
    await documentClient.send(cmd);
    const result = await documentClient.send(cmd2);
    const response = result.Attributes as TweetEntity;
    const sub = response.id.split("-")[1];
    const updatedTweet = await getProfileImageForSingleTweet(
      response,
      response.id,
      getSKFromUserName(response.userName, sub, true),
    );
    return updatedTweet;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getTweet = async (pk: string, sk: string) => {
  const cmd = new GetCommand({
    TableName: config.TABLE_NAME,
    Key: {
      id: pk,
      entityType: sk,
    },
  });
  try {
    const res = await documentClient.send(cmd);
    return res.Item as TweetEntity;
  } catch (e) {
    console.log(e);
    return null;
  }
};

// Controller for updating an user given by pk and sk
export const updateTweet = async (content: string, pk: string, sk: string) => {
  const cmd = new UpdateCommand({
    TableName: config.TABLE_NAME,
    Key: {
      id: pk,
      entityType: sk,
    },
    UpdateExpression: "set #content = :content, #isEdited = :isEdited",
    ExpressionAttributeNames: {
      "#content": "content",
      "#isEdited": "isEdited",
    },
    ExpressionAttributeValues: {
      ":content": content,
      ":isEdited": true,
    },
    ReturnValues: "ALL_NEW",
  });
  try {
    const response = (await documentClient.send(cmd)).Attributes as TweetEntity;
    const sub = response.id.split("-")[1];
    const updatedTweet = await getProfileImageForSingleTweet(
      response,
      response.id,
      getSKFromUserName(response.userName, sub, true),
    );
    return updatedTweet;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const doAddComment = async (newComment: Comment) => {
  const cmd = new UpdateCommand({
    TableName: config.TABLE_NAME,
    Key: {
      id: newComment.tweetPK,
      entityType: newComment.tweetSK,
    },
    UpdateExpression:
      "set #comments = list_append(#comments, :new_comment), #commentCount = #commentCount + :incr",
    ExpressionAttributeValues: {
      ":new_comment": [newComment],
      ":incr": 1,
    },
    ExpressionAttributeNames: {
      "#comments": "comments",
      "#commentCount": "commentCount",
    },
    ReturnValues: "ALL_NEW",
  });
  try {
    const res = await documentClient.send(cmd);
    return res.Attributes;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getAllTweetsLikedByMe = async (pk: string) => {
  const params: QueryCommandInput = {
    TableName: config.TABLE_NAME,
    IndexName: config.GSI1_NAME,
    KeyConditionExpression:
      "#entity = :entity and begins_with(#entityType, :tweet)",
    FilterExpression: "contains(#set, :pk)",
    ExpressionAttributeNames: {
      "#entity": "entity",
      "#entityType": "entityType",
      "#set": "likedBy"
    },
    ExpressionAttributeValues: {
      ":entity": "tweet",
      ":tweet": "Tweet",
      ":pk": pk,
    },
  };
  try {
    const cmd = new QueryCommand(params);
    const res = await documentClient.send(cmd);
    return res.Items as TweetEntity[];
  } catch (e) {
    console.log(e);
    return null;
  }
};
