import { getSKForFollowing } from "../helpers/util";

export interface Follower {
  id: string,
  followingUserId: string,
  entity: string,
  entityType: string,
  entityValue: string,
}

export const createFollower = (pk: string, toFollow: string) => {
  const id = pk;
  const followingUserId = toFollow;
  const entity = "Following";
  const entityType = getSKForFollowing(toFollow);
  const entityValue = entityType;
  return {
    id,
    followingUserId,
    entity,
    entityType,
    entityValue,
  };
};