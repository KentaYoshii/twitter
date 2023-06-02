import {
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import config from "../config";
import { UserToken } from "../oidc";
import { UserEntity, createNewUser } from "../models/UserEntity";
import { documentClient } from "./db_init";
import {
  countFollowee,
  countFollowing,
  populateRelations,
} from "./db_relation";
import { createPresignedUrl } from "../storage/s3_action";

export type UpdateUserRequestBody = {
  country: string;
  favColor: string;
  introduction: string;
};

// Given a pk, fetch the UserEntity, if exists
// 1. Fetch user in our table
// 2. Count Followers and Followees
// 3. If this is returned to the front, sign profile image
export const getUserByPK = async (
  pk: string,
  sk: string,
  sign: boolean,
): Promise<UserEntity | null> => {
  const params: GetCommandInput = {
    TableName: config.TABLE_NAME,
    Key: {
      id: pk,
      entityType: sk,
    },
  };
  try {
    const cmd = new GetCommand(params);
    const response: GetCommandOutput = await documentClient.send(cmd);
    if (!response.Item) {
      return null;
    }
    const user = response.Item as UserEntity;
    const followingCount = await countFollowing(pk);
    if (followingCount === null || followingCount === undefined) {
      return null;
    }
    user.followingCount = followingCount;
    const followeeCount = await countFollowee(pk);
    if (followeeCount === null || followeeCount === undefined) {
      return null;
    }
    user.followerCount = followeeCount;
    if (user.profileImageUpdated && sign) {
      user.profileImage = await createPresignedUrl(user.profileImage);
    }
    return user;
  } catch (e: unknown) {
    console.log(e);
    return null;
  }
};

// Updates user's profile image
export const updateUserProfileImage = async (
  newImgKey: string,
  pk: string,
  sk: string,
) => {
  const cmd = new UpdateCommand({
    TableName: config.TABLE_NAME,
    Key: {
      id: pk,
      entityType: sk,
    },
    UpdateExpression:
      "set profileImage = :image_key, profileImageUpdated = :val",
    ExpressionAttributeValues: {
      ":image_key": newImgKey,
      ":val": true,
    },
    ReturnValues: "ALL_NEW",
  });
  try {
    await documentClient.send(cmd);
    return newImgKey;
  } catch (e) {
    console.log(e);
    return null;
  }
};

// Update an user given by pk and sk
export const updateUser = async (
  newVals: UpdateUserRequestBody,
  pk: string,
  sk: string,
) => {
  const { introduction, favColor, country } = newVals;
  const cmd = new UpdateCommand({
    TableName: config.TABLE_NAME,
    Key: {
      id: pk,
      entityType: sk,
    },
    UpdateExpression:
      "set introduction = :introduction, favColor = :favColor, country = :country",
    ExpressionAttributeValues: {
      ":introduction": introduction,
      ":favColor": favColor,
      ":country": country,
    },
    ReturnValues: "ALL_NEW",
  });
  try {
    const response = await documentClient.send(cmd);
    return response;
  } catch (e) {
    console.log(e);
    return null;
  }
};

// Given a newUser struct, add the new user to our db
export const registerUser = async (
  newUser: UserToken,
): Promise<UserEntity | null> => {
  const user = createNewUser(newUser);
  const params: PutCommandInput = {
    TableName: config.TABLE_NAME,
    Item: {
      // Required columns
      id: user.id, // PK
      entityType: user.entityType, // SK
      entityValue: user.entityValue,
      // Unique to UserEntity
      createdAt: user.createdAt,
      email: user.email,
      profileImage: user.profileImage,
      profileImageUpdated: user.profileImageUpdated,
      introduction: user.introduction,
      country: user.country,
      tweetCount: user.tweetCount,
      favColor: user.favColor,
      entity: user.entity,
    },
  };
  try {
    const cmd = new PutCommand(params);
    await documentClient.send(cmd);
    return user;
  } catch (e: unknown) {
    console.log(e);
    return null;
  }
};

// Either decrement/increment the tweet count stored in user entity
export const modifyTweetCountBy = async (
  pk: string,
  sk: string,
  changeBy: number,
) => {
  const params: UpdateCommandInput = {
    TableName: config.TABLE_NAME,
    Key: {
      id: pk,
      entityType: sk,
    },
    UpdateExpression: "set #tweetCount = #tweetCount + :changeBy",
    ExpressionAttributeNames: {
      "#tweetCount": "tweetCount",
    },
    ExpressionAttributeValues: {
      ":changeBy": changeBy,
    },
    ReturnValues: "ALL_NEW",
  };
  try {
    const cmd = new UpdateCommand(params);
    const response = await documentClient.send(cmd);
    return response;
  } catch (e) {
    console.log(e);
    return null;
  }
};

// Sign a profile image
// * do not sign if the image is default image (user has not updated their profile image yet)
export const signedProfileImage = async (user: UserEntity) => {
  if (!user.profileImageUpdated) {
    return user;
  }
  const newUser = { ...user };
  const signedUrl = await createPresignedUrl(user.profileImage);
  newUser.profileImage = signedUrl;
  return newUser;
};

// Scan the table and get all users that are not me
export const queryAllUsers = async (pk: string) => {
  const params: QueryCommandInput = {
    TableName: config.TABLE_NAME,
    IndexName: config.GSI1_NAME,
    KeyConditionExpression:
      "#entity = :entity and begins_with(#entityType, :user_entity)",
    FilterExpression: "#filterBy <> :filterValue",
    ExpressionAttributeNames: {
      "#entity": "entity",
      "#entityType": "entityType",
      "#filterBy": "id",
    },
    ExpressionAttributeValues: {
      ":entity": "User",
      ":user_entity": "User",
      ":filterValue": pk,
    },
  };
  try {
    const cmd = new QueryCommand(params);
    const res = await documentClient.send(cmd);
    const midRes = await populateRelations(pk, res.Items as UserEntity[]);
    const userPromises = midRes.map((user) => signedProfileImage(user));
    return await Promise.all(userPromises);
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getAllUsersInSet = async (userPKs: Set<string>) => {
  const params: QueryCommandInput = {
    TableName: config.TABLE_NAME,
    IndexName: config.GSI1_NAME,
    KeyConditionExpression:
      "#entity = :entity and begins_with(#entityType, :user_entity)",
    ExpressionAttributeNames: {
      "#entity": "entity",
      "#entityType": "entityType",
    },
    ExpressionAttributeValues: {
      ":entity": "User",
      ":user_entity": "User",
    },
  };
  try {
    const cmd = new QueryCommand(params);
    const res = (await documentClient.send(cmd)).Items as UserEntity[];
    const toRet: UserEntity[] = []
    res.map((usr) => {
      if(userPKs.has(usr.id)){
        toRet.push(usr);
      }
      return null;
    })
    return toRet;
  } catch(e) {
    console.log(e);
    return null;
  }
};
