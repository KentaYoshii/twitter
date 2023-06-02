/* eslint-disable no-restricted-syntax */
import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { documentClient } from "./db_init";
import { getUserByPK } from "./db_user";
import { TweetEntity } from "../models/TweetEntity";
import config from "../config";
import { createNewTimeline, Timeline } from "../models/TimelineEntity";
import { Followee } from "../models/FolloweeEntity";
import { getTweets } from "./db_tweet";
import { getSKForTimeline, getSKFromUserName } from "../helpers/util";

export const fillDoILikeTimeline = (pk: string, tweets: Timeline[]) =>
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

export const getTimelineAddedByUser = async (
  forUser: string,
  byUser: string,
) => {
  const params: QueryCommandInput = {
    TableName: config.TABLE_NAME,
    IndexName: config.GSI2_NAME,
    KeyConditionExpression:
      "#id = :forUser and begins_with(#entityValue, :substring)",
    ExpressionAttributeNames: {
      "#id": "id",
      "#entityValue": "entityValue",
    },
    ExpressionAttributeValues: {
      ":forUser": forUser,
      ":substring": `Timeline-${byUser}`,
    },
  };
  try {
    const cmd = new QueryCommand(params);
    const res: QueryCommandOutput = await documentClient.send(cmd);
    return res.Items;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const onFollow = async (forUser: string, followedUser: string) => {
  const tweets = await getTweets(followedUser);
  if (!tweets) {
    return false;
  }
  if (tweets.length === 0) {
    return true;
  }
  const putRequests = [];
  for (const tweet of tweets as TweetEntity[]) {
    const newTimeline = createNewTimeline(forUser, followedUser, tweet);
    putRequests.push({
      PutRequest: {
        Item: {
          id: newTimeline.id,
          entityType: newTimeline.entityType,
          userName: newTimeline.userName,
          posterId: newTimeline.posterId,
          entityValue: newTimeline.entityValue,
          createdAt: newTimeline.createdAt,
          content: newTimeline.content,
          entity: newTimeline.entity,
          isEdited: newTimeline.isEdited,
          images: newTimeline.images,
          likeCount: newTimeline.likeCount,
          likedBy: newTimeline.likedBy,
          tweetEntityType: newTimeline.tweetEntityType,
          commentCount: newTimeline.commentCount,
        },
      },
    });
  }
  const params: BatchWriteCommandInput = {
    RequestItems: {
      [config.TABLE_NAME]: putRequests,
    },
  };
  try {
    const cmd = new BatchWriteCommand(params);
    await documentClient.send(cmd);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const onUnFollow = async (forUser: string, unFollowedUser: string) => {
  const timelines = await getTimelineAddedByUser(forUser, unFollowedUser);
  if (!timelines) {
    return false;
  }
  if (timelines.length === 0) {
    return true;
  }
  const deleteRequests = [];
  for (const timeline of timelines as Timeline[]) {
    deleteRequests.push({
      DeleteRequest: {
        Key: {
          id: timeline.id,
          entityType: timeline.entityType,
        },
      },
    });
  }
  const params: BatchWriteCommandInput = {
    RequestItems: {
      [config.TABLE_NAME]: deleteRequests,
    },
  };
  try {
    const cmd = new BatchWriteCommand(params);
    await documentClient.send(cmd);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const getProfileImageForSingleTimeline = async (
  tweet: Timeline,
  posterPK: string,
  posterSK: string,
) => {
  const user = await getUserByPK(posterPK, posterSK, true);
  const { profileImage } = user!;
  const newTL = { ...tweet };
  newTL.profileImage = profileImage;
  return newTL;
};

export const populateTimelinesProfileImage = async (tweets: Timeline[]) => {
  const tweetsPromises = tweets.map((tweet) => {
    const pk = tweet.posterId;
    const sub = pk.split("-")[1];
    const sk = getSKFromUserName(tweet.userName, sub, true);
    return getProfileImageForSingleTimeline(tweet, pk, sk);
  });
  try {
    return await Promise.all(tweetsPromises);
  } catch {
    return null;
  }
};

export const getTimeline = async (forUser: string) => {
  const params: QueryCommandInput = {
    TableName: config.TABLE_NAME,
    KeyConditionExpression:
      "#id = :forUser and begins_with(#entityType, :timeline_entity)",
    ExpressionAttributeNames: {
      "#id": "id",
      "#entityType": "entityType",
    },
    ExpressionAttributeValues: {
      ":forUser": forUser,
      ":timeline_entity": "Timeline",
    },
    ScanIndexForward: false,
  };
  try {
    const cmd = new QueryCommand(params);
    const res = await documentClient.send(cmd);
    const results = res.Items as Timeline[];
    const tweets = fillDoILikeTimeline(forUser, results);
    const tls = await populateTimelinesProfileImage(tweets);
    if (!tls) {
      return null;
    }
    tls.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    return tls;
  } catch (e) {
    console.log(e);
    return null;
  }
};

// PUT | DELETE
export const writeToMyFollowersFeed = async (
  poster: string,
  tweet: TweetEntity,
  followees: Followee[],
  operation: string,
) => {
  const requests = [];
  for (const followee of followees) {
    let reqItem = {};
    switch (operation) {
      case "PUT":
        {
          const newTimeline = createNewTimeline(
            followee.followedBy,
            poster,
            tweet,
          );
          reqItem = {
            PutRequest: {
              Item: {
                id: newTimeline.id,
                entityType: newTimeline.entityType,
                userName: newTimeline.userName,
                posterId: newTimeline.posterId,
                entityValue: newTimeline.entityValue,
                createdAt: newTimeline.createdAt,
                content: newTimeline.content,
                entity: newTimeline.entity,
                isEdited: newTimeline.isEdited,
                images: newTimeline.images,
                likeCount: newTimeline.likeCount,
                likedBy: newTimeline.likedBy,
                tweetEntityType: newTimeline.tweetEntityType,
                commentCount: newTimeline.commentCount,
              },
            },
          };
        }
        break;
      case "DELETE":
        reqItem = {
          DeleteRequest: {
            Key: {
              id: followee.followedBy,
              entityType: getSKForTimeline(tweet.createdAt, poster),
            },
          },
        };
        break;
      default:
        return null;
    }
    requests.push(reqItem);
  }

  const params: BatchWriteCommandInput = {
    RequestItems: {
      [config.TABLE_NAME]: requests,
    },
  };
  try {
    const cmd = new BatchWriteCommand(params);
    await documentClient.send(cmd);
    return requests;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const doSingleUpdate = async (
  forUser: string,
  poster: string,
  updateObj: TweetEntity,
  likeTup: [boolean, boolean],
) => {
  const pk = forUser;
  const sk = getSKForTimeline(updateObj.createdAt, poster);
  console.log(pk, sk)
  let diff = 0;
  const { isEdited } = updateObj;
  if (likeTup[0]) {
    if (likeTup[1]) {
      diff = 1;
    } else {
      diff = -1;
    }
  }
  const params: UpdateCommandInput = {
    TableName: config.TABLE_NAME,
    Key: {
      id: pk,
      entityType: sk,
    },
    UpdateExpression:
      "set #content = :content, #isEdited = :isEdited, #likeCount = #likeCount + :diff",
    ExpressionAttributeNames: {
      "#content": "content",
      "#isEdited": "isEdited",
      "#likeCount": "likeCount",
    },
    ExpressionAttributeValues: {
      ":content": updateObj.content,
      ":isEdited": isEdited,
      ":diff": diff,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const cmd = new UpdateCommand(params);
    await documentClient.send(cmd);
    if (!likeTup[0]) {
      return cmd;
    }
    let likeParams: UpdateCommandInput;
    if (likeTup[1]) {
      likeParams = {
        TableName: config.TABLE_NAME,
        Key: {
          id: pk,
          entityType: sk,
        },
        UpdateExpression: "add #likedBy :viewer",
        ExpressionAttributeNames: {
          "#likedBy": "likedBy",
        },
        ExpressionAttributeValues: {
          ":viewer": new Set<string>([updateObj.id]),
        },
        ReturnValues: "ALL_NEW",
      };
    } else {
      likeParams = {
        TableName: config.TABLE_NAME,
        Key: {
          id: pk,
          entityType: sk,
        },
        UpdateExpression: "delete #likedBy :viewer",
        ExpressionAttributeNames: {
          "#likedBy": "likedBy",
        },
        ExpressionAttributeValues: {
          ":viewer": new Set<string>([updateObj.id]),
        },
        ReturnValues: "ALL_NEW",
      };
    }
    const cmd2 = new UpdateCommand(likeParams);
    await documentClient.send(cmd2);
    return cmd2;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const spreadUpdates = async (
  followees: Followee[],
  poster: string,
  updateObj: TweetEntity,
  likeTup: [boolean, boolean],
) => {
  const updatesPromise = [];
  for (const followee of followees) {
    updatesPromise.push(
      doSingleUpdate(followee.followedBy, poster, updateObj, likeTup),
    );
  }
  await Promise.all(updatesPromise);
};

const doSingleCommentAddedUpdate = async (
  forUser: string,
  poster: string,
  updateObj: TweetEntity,
) => {
  const pk = forUser;
  const sk = getSKForTimeline(updateObj.createdAt, poster);
  const params: UpdateCommandInput = {
    TableName: config.TABLE_NAME,
    Key: {
      id: pk,
      entityType: sk,
    },
    UpdateExpression:
      "set #commentCount = #commentCount + :incr",
    ExpressionAttributeNames: {
      "#commentCount": "commentCount",
    },
    ExpressionAttributeValues: {
      ":incr": 1,
    },
    ReturnValues: "ALL_NEW",
  };
  try {
    const cmd = new UpdateCommand(params);
    await documentClient.send(cmd);
    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const spreadCommentAddedUpdates = async (
  followees: Followee[],
  poster: string,
  updateObj: TweetEntity,
) => {
  const updatesPromise = [];
  for (const followee of followees) {
    updatesPromise.push(
      doSingleCommentAddedUpdate(followee.followedBy, poster, updateObj),
    );
  } 
  try {
    await Promise.all(updatesPromise);
  } catch (e) {
    console.log(e);
  }
  
}
