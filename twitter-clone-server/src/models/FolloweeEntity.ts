import { getSKForFollowee } from "../helpers/util";

export interface Followee {
  id: string,
  followedBy: string,
  entity: string,
  entityType: string,
  entityValue: string,
}

export const createFollowee = (followedUser: string, followingUser: string) => {
  const id = followedUser;
  const followedBy = followingUser;
  const entity = "Followee";
  const entityType = getSKForFollowee(followingUser);
  const entityValue = entityType;
  return {
    id,
    followedBy,
    entity,
    entityType,
    entityValue,
  }
}