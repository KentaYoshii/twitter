/* eslint-disable no-restricted-syntax */
import {
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  DeleteCommand,
  DeleteCommandInput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";

import { Follower } from "../models/FollowerEntity";
import config from "../config";
import { documentClient } from "./db_init";
import { getSKForFollowee, getSKForFollowing } from "../helpers/util";
import { UserEntity } from "../models/UserEntity";
import { createFollowee } from "../models/FolloweeEntity";

export const countFollowing = async (forUser: string) => {
  const params: QueryCommandInput = {
    TableName: config.TABLE_NAME,
    KeyConditionExpression:
      "#id = :for and begins_with(#entityType, :following_entity)",
    ExpressionAttributeNames: {
      "#id": "id",
      "#entityType": "entityType",
    },
    ExpressionAttributeValues: {
      ":for": forUser,
      ":following_entity": "Following",
    },
  };
  try {
    const cmd = new QueryCommand(params);
    const res: QueryCommandOutput = await documentClient.send(cmd);
    return res.Count;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const countFollowee = async (forUser: string) => {
  const params: QueryCommandInput = {
    TableName: config.TABLE_NAME,
    KeyConditionExpression:
      "#id = :for and begins_with(#entityType, :followee_entity)",
    ExpressionAttributeNames: {
      "#id": "id",
      "#entityType": "entityType",
    },
    ExpressionAttributeValues: {
      ":for": forUser,
      ":followee_entity": "Followee",
    },
  };
  try {
    const cmd = new QueryCommand(params);
    const res: QueryCommandOutput = await documentClient.send(cmd);
    return res.Count;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getFollowingRelation = async (forUser: string) => {
  const params: QueryCommandInput = {
    TableName: config.TABLE_NAME,
    KeyConditionExpression:
      "#id = :for and begins_with(#entityType, :following_entity)",
    ExpressionAttributeNames: {
      "#id": "id",
      "#entityType": "entityType",
    },
    ExpressionAttributeValues: {
      ":for": forUser,
      ":following_entity": "Following",
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

export const getFolloweeRelation = async (forUser: string) => {
  const params: QueryCommandInput = {
    TableName: config.TABLE_NAME,
    KeyConditionExpression:
      "#id = :for and begins_with(#entityType, :followee_entity)",
    ExpressionAttributeNames: {
      "#id": "id",
      "#entityType": "entityType",
    },
    ExpressionAttributeValues: {
      ":for": forUser,
      ":followee_entity": "Followee",
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

export const addNewFolloweeRelation = async (
  followingUser: string,
  followedUser: string,
) => {
  const followeeEntity = createFollowee(followedUser, followingUser);
  const params: PutCommandInput = {
    TableName: config.TABLE_NAME,
    Item: {
      id: followeeEntity.id,
      entity: followeeEntity.entity,
      entityType: followeeEntity.entityType,
      followedBy: followeeEntity.followedBy,
    },
  };
  try {
    const cmd = new PutCommand(params);
    await documentClient.send(cmd);
    return followeeEntity;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const removeFolloweeRelation = async (
  followingUser: string,
  followedUser: string,
) => {
  const params: DeleteCommandInput = {
    TableName: config.TABLE_NAME,
    Key: {
      id: followedUser,
      entityType: getSKForFollowee(followingUser),
    },
  };
  try {
    const cmd = new DeleteCommand(params);
    await documentClient.send(cmd);
    return followedUser;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const addNewFollowingRelation = async (newFollowing: Follower) => {
  const params: PutCommandInput = {
    TableName: config.TABLE_NAME,
    Item: {
      id: newFollowing.id,
      entityType: newFollowing.entityType,
      entity: newFollowing.entity,
      followingUserId: newFollowing.followingUserId,
    },
  };
  try {
    const cmd = new PutCommand(params);
    await documentClient.send(cmd);
  } catch (e) {
    console.log(e);
    return null;
  }
  const res = await addNewFolloweeRelation(
    newFollowing.id,
    newFollowing.followingUserId,
  );
  if (!res) {
    return null;
  }
  return newFollowing;
};

export const removeFollowingRelation = async (pk: string, toRemove: string) => {
  const sk = getSKForFollowing(toRemove);
  const params: DeleteCommandInput = {
    TableName: config.TABLE_NAME,
    Key: {
      id: pk,
      entityType: sk,
    },
  };
  try {
    const cmd = new DeleteCommand(params);
    await documentClient.send(cmd);
  } catch (e) {
    console.log(e);
    return null;
  }
  const res = await removeFolloweeRelation(pk, toRemove);
  if (!res) {
    return null;
  }
  return toRemove;
};

export const doIFollow = async (pk: string, otherpk: string) => {
  const params: GetCommandInput = {
    TableName: config.TABLE_NAME,
    Key: {
      id: pk,
      entityType: getSKForFollowing(otherpk),
    },
  };
  try {
    const cmd = new GetCommand(params);
    const res = await documentClient.send(cmd);
    return !!res.Item;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const amIFollowed = async (me: string, other: string) => {
  const params: GetCommandInput = {
    TableName: config.TABLE_NAME,
    Key: {
      id: me,
      entityType: getSKForFollowee(other),
    },
  };
  try {
    const cmd = new GetCommand(params);
    const res = await documentClient.send(cmd);
    return !!res.Item;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const populateRelation = async (forUser: string, other: UserEntity) => {
  const modifiedUser = { ...other };
  const follow = await doIFollow(forUser, other.id);
  if (follow) {
    modifiedUser.following = true;
  } else {
    modifiedUser.following = false;
  }
  const followed = await amIFollowed(forUser, other.id);
  if (followed) {
    modifiedUser.followed = true;
  } else {
    modifiedUser.followed = false;
  }
  return modifiedUser;
};

export const populateRelations = async (
  forUser: string,
  others: UserEntity[],
) => {
  const modifiedOthers = [];
  for (const other of others) {
    modifiedOthers.push(populateRelation(forUser, other));
  }
  const res = await Promise.all(modifiedOthers)
  return res;
};
