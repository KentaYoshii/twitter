/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import {
  createTweet,
  getTweets,
  deleteTweet,
  updateTweet,
  getOtherTweets,
  signImagesForTweet,
  signImagesForTweets,
  signImagesForTimelines,
  getTweet,
  doLikeTweet,
  doUnLikeTweet,
  fillDoILikeTweets,
  populateTweetsProfileImage,
  doAddComment,
  getAllTweetsLikedByMe,
} from "../database/db_tweet";
import {
  getUserByPK,
  modifyTweetCountBy,
  getAllUsersInSet,
  signedProfileImage,
} from "../database/db_user";
import {
  getTimeline,
  spreadCommentAddedUpdates,
  spreadUpdates,
  writeToMyFollowersFeed,
} from "../database/db_timeline";
import { getFolloweeRelation } from "../database/db_relation";
import { Followee } from "../models/FolloweeEntity";
import { TweetEntity, newComment } from "../models/TweetEntity";
import { getKeysForImages } from "../helpers/util";
import { uploadFiles } from "../storage/s3_action";

interface CreateTweetRequestBody {
  content: string;
  file0: string;
  file1: string;
  file2: string;
  file3: string;
}

interface DeleteTweetRequestBody {
  pk: string;
  sk: string;
}

export type LikedUser = {
  pk: string;
  sk: string;
  profileImage: string;
};
export type UpdateTweetRequestBody = {
  content: string;
  pk: string;
  sk: string;
};

export type LikeTweetRequestBody = {
  isLike: boolean;
  pk: string;
  sk: string;
};

export const modifyTweetsProfileImage = (
  tweets: TweetEntity[],
  updateTo: string,
) =>
  tweets.map((tweet) => {
    const newTweet = { ...tweet };
    newTweet.profileImage = updateTo;
    return newTweet;
  });

// Get all the tweets made by this User
export const getMyTweets = async (req: Request, res: Response) => {
  if (!req.session) {
    res.status(500).send();
    return;
  }
  if (!req.session.isAuth || !req.session.uid || !req.session.entityType) {
    res.status(401).send();
    return;
  }
  try {
    const tweets = (await getTweets(req.session.uid)) as TweetEntity[];
    const user = await getUserByPK(
      req.session.uid,
      req.session.entityType,
      true,
    );
    if (!user) {
      res.status(500).send();
      return;
    }
    const { profileImage } = user;
    const newTweets = modifyTweetsProfileImage(tweets, profileImage);
    const intermediateTweets = fillDoILikeTweets(req.session.uid, newTweets);
    const finalTweets = await signImagesForTweets(intermediateTweets);
    res.status(200).json({ tweets: finalTweets });
  } catch {
    res.status(500).send();
  }
};

export const getTweetByPK = async (req: Request, res: Response) => {
  if (!req.session || !req.session.uid || !req.session.entityType) {
    res.status(500).send();
    return;
  }
  const { id, entityType } = req.params;
  if (!id || !entityType) {
    res.status(400).send();
    return;
  }
  const pk = id;
  const sk = entityType;
  try {
    const tweet = await getTweet(pk, sk);
    if (!tweet) {
      res.status(500).send();
      return;
    }
    const nextTweet = await signImagesForTweet(tweet);
    if (!nextTweet) {
      res.status(500).send();
      return;
    }
    const newTweet = await populateTweetsProfileImage([nextTweet]);
    if (!newTweet) {
      res.status(500).send();
      return;
    }
    if (newTweet[0].comments.length !== 0) {
      const commentsPromises = newTweet[0].comments.map(async (ele) => {
        const cp = { ...ele };
        const user = await getUserByPK(ele.posterPK, ele.posterSK, true);
        cp.profileImage = user!.profileImage;
        return cp;
      });
      const finalComments = await Promise.all(commentsPromises);
      finalComments.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      newTweet[0].comments = finalComments;
    }

    const { likedBy } = nextTweet;
    if (likedBy.size === 1) {
      res.status(200).json({ tweet: newTweet[0] });
      return;
    }
    const users = await getAllUsersInSet(likedBy);
    if (!users || users.length === 0) {
      res.status(200).json({ tweet: newTweet[0] });
      return;
    }
    const userPromises = users.map((user) => {
      if (!user.profileImageUpdated) {
        return user;
      }
      return signedProfileImage(user);
    });
    const newUsers = await Promise.all(userPromises);
    const likedUsers: LikedUser[] = [];
    newUsers.map((user) =>
      likedUsers.push({
        pk: user.id,
        sk: user.entityType,
        profileImage: user.profileImage,
      }),
    );
    res.status(200).json({ tweet: newTweet[0], likedUsers });
  } catch {
    res.status(500).send();
  }
};

// Delete one tweet made by this user
// - 1. Delete from db
// - 2. Delete from my Followees' timeline
export const deleteMyTweet = async (
  req: Request<{}, {}, DeleteTweetRequestBody>,
  res: Response,
) => {
  const { pk, sk } = req.body;
  if (!req.session) {
    res.status(500).send();
    return;
  }
  if (!req.session.isAuth || !req.session.uid || !req.session.entityType) {
    res.status(401).send();
    return;
  }
  const usrSK = req.session.entityType;
  try {
    const delTweet = await deleteTweet(pk, sk);
    if (!delTweet) {
      res.status(500).send();
      return;
    }
    const suc = await modifyTweetCountBy(pk, usrSK, -1);
    if (!suc) {
      res.status(500).send();
      return;
    }
    const followees = await getFolloweeRelation(req.session.uid);
    if (!followees) {
      res.status(500).send();
      return;
    }
    if (followees.length === 0) {
      res.status(200).send();
      return;
    }
    const suc2 = await writeToMyFollowersFeed(
      req.session.uid,
      delTweet,
      followees as Followee[],
      "DELETE",
    );
    if (!suc2) {
      res.status(500).send();
    } else {
      res.status(200).send();
    }
  } catch {
    res.status(500).send();
  }
};

export const likeTweet = async (
  req: Request<{}, {}, LikeTweetRequestBody>,
  res: Response,
) => {
  if (!req.session) {
    res.status(500).send();
    return;
  }
  if (!req.session.isAuth || !req.session.uid || !req.session.entityType) {
    res.status(401).send();
    return;
  }
  const { pk, sk, isLike } = req.body;
  try {
    // get the tweet
    const tweet = await getTweet(pk, sk);
    if (!tweet) {
      res.status(500).send();
      return;
    }
    const { likedBy } = tweet;
    let updatedTweet;
    // If I have not liked this tweet before
    if (!likedBy.has(req.session.uid)) {
      // add me to the set and increment the count
      updatedTweet = await doLikeTweet(pk, req.session.uid, sk);
    } else {
      // Dislike the tweet and decrement the count
      updatedTweet = await doUnLikeTweet(pk, req.session.uid, sk);
    }
    if (!updatedTweet) {
      res.status(500).send();
      return;
    }
    updatedTweet.doILike = isLike;
    // notify others of change
    const followee = await getFolloweeRelation(pk);
    if (!followee) {
      res.status(500).send();
      return;
    }
    if (followee.length === 0) {
      const newTweet = await signImagesForTweet(updatedTweet);
      res.status(200).json({ ...newTweet });
      return;
    }
    await spreadUpdates(followee as Followee[], tweet.id, updatedTweet, [
      true,
      isLike,
    ]);
    const newTweet = await signImagesForTweet(updatedTweet);
    res.status(200).json({ ...newTweet });
  } catch {
    res.status(500).send();
  }
};

// Update my tweet
// 1. Update db
// 2. Spread the change to my followees' timeline
export const updateMyTweet = async (
  req: Request<{}, {}, UpdateTweetRequestBody>,
  res: Response,
) => {
  if (!req.session) {
    res.status(500).send();
    return;
  }
  if (!req.session.isAuth || !req.session.uid || !req.session.entityType) {
    res.status(401).send();
    return;
  }
  const { pk, sk, content } = req.body;
  if (content.length > 300) {
    res.status(401).send();
    return;
  }
  try {
    const updatedTweet = await updateTweet(content, pk, sk);
    if (!updatedTweet) {
      res.status(500).send();
      return;
    }
    const midTweet = fillDoILikeTweets(req.session.uid, [updatedTweet]);
    // notify others of change
    const followee = await getFolloweeRelation(pk);
    if (!followee) {
      res.status(500).send();
      return;
    }
    if (followee.length === 0) {
      const newTweet = await signImagesForTweet(midTweet[0]);

      res.status(200).json({ ...newTweet });
      return;
    }
    await spreadUpdates(followee as Followee[], req.session.uid, midTweet[0], [
      false,
      false,
    ]);
    const newTweet = await signImagesForTweet(midTweet[0]);
    res.status(200).json({ ...newTweet });
  } catch {
    res.status(500).send();
  }
};

// Create one single tweet for this user
// 1. Store in db
// 2. Write to my Followees' timeline
export const createMyTweet = async (
  req: Request<{}, {}, CreateTweetRequestBody>,
  res: Response,
) => {
  if (!req.session) {
    res.status(500).send();
    return;
  }
  if (!req.session.isAuth || !req.session.uid || !req.session.entityType) {
    res.status(401).send();
    return;
  }
  const pk = req.session.uid;
  const sk = req.session.entityType;
  if (!req.body.content || req.body.content.length > 300) {
    res.status(400).send();
    return;
  }
  let images = [];
  if (req.files) {
    images = Object.values(req.files);
    images = images.flat();
  }
  // Gen keys for images
  const imgEntities = getKeysForImages(pk, images as Express.Multer.File[]);
  const tweet = await createTweet(req.body.content, imgEntities, pk, sk);
  if (!tweet) {
    res.status(500).send();
    return;
  }
  // Upload images
  if (imgEntities.length !== 0) {
    await uploadFiles(imgEntities);
  }
  const followees = await getFolloweeRelation(pk);
  if (followees === null || followees === undefined) {
    res.status(500).send();
    return;
  }
  if (followees.length > 0) {
    const suc = await writeToMyFollowersFeed(
      pk,
      tweet,
      followees as Followee[],
      "PUT",
    );
    if (!suc) {
      res.status(500).send();
      return;
    }
  }
  // I guess it's okay for this to fail? We can still display tweets w/o images
  const newTweet = await signImagesForTweet(tweet);
  const ok = await modifyTweetCountBy(pk, sk, 1);
  if (!ok) {
    res.status(500).send();
  } else {
    res.status(200).json({ ...newTweet });
  }
};

// For Global Feed
export const getAllOtherTweets = async (req: Request, res: Response) => {
  if (!req.session) {
    res.status(500).send();
    return;
  }
  if (!req.session.isAuth || !req.session.uid || !req.session.entityType) {
    res.status(401).send();
    return;
  }
  const pk = req.session.uid;
  try {
    const tweets = await getOtherTweets(pk);
    res.status(200).json(tweets);
  } catch {
    res.status(500).send();
  }
};

// For Personal Feed
export const getPersonalTweets = async (req: Request, res: Response) => {
  if (!req.session) {
    res.status(500).send();
    return;
  }
  if (!req.session.isAuth || !req.session.uid || !req.session.entityType) {
    res.status(401).send();
    return;
  }
  const forUser = req.session.uid;
  try {
    const tweets = await getTimeline(forUser);
    if (!tweets) {
      res.status(500).send();
      return;
    }
    const newTweets = await signImagesForTimelines(tweets);
    res.status(200).json(newTweets);
  } catch {
    res.status(500).send();
  }
};

interface AddCommentRequestBody {
  tweetPK: string;
  tweetSK: string;
  posterPK: string;
  posterSK: string;
  profileImage: string;
  posterName: string;
  content: string;
}

export const addComment = async (
  req: Request<{}, {}, AddCommentRequestBody>,
  res: Response,
) => {
  if (!req.session) {
    res.status(500).send();
    return;
  }
  if (!req.session.isAuth || !req.session.uid || !req.session.entityType) {
    res.status(401).send();
    return;
  }
  const {
    tweetPK,
    tweetSK,
    posterPK,
    posterSK,
    profileImage,
    posterName,
    content,
  } = req.body;
  if (
    !tweetPK ||
    !tweetSK ||
    !posterPK ||
    !posterSK ||
    !content ||
    !profileImage ||
    !posterName ||
    content.length > 50
  ) {
    res.status(400).send();
    return;
  }

  const comment = newComment(
    tweetPK,
    tweetSK,
    posterPK,
    posterSK,
    profileImage,
    posterName,
    content,
  );
  try {
    const tweet = (await doAddComment(comment)) as TweetEntity;
    if (!tweet) {
      res.status(500).send();
      return;
    }
    const followees = await getFolloweeRelation(tweetPK);
    if (followees === null || followees === undefined) {
      res.status(500).send();
      return;
    }
    if (followees.length > 0) {
      await spreadCommentAddedUpdates(followees as Followee[], tweetPK, tweet);
    }
    const nextTweet = await signImagesForTweet(tweet);
    if (!nextTweet) {
      res.status(500).send();
      return;
    }
    const newTweet = await populateTweetsProfileImage([nextTweet]);
    if (!newTweet) {
      res.status(500).send();
      return;
    }
    if (newTweet[0].comments.length !== 0) {
      const commentsPromises = newTweet[0].comments.map(async (ele) => {
        const cp = { ...ele };
        const user = await getUserByPK(ele.posterPK, ele.posterSK, true);
        cp.profileImage = user!.profileImage;
        return cp;
      });
      const finalComments = await Promise.all(commentsPromises);
      finalComments.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      newTweet[0].comments = finalComments;
    }
    const { likedBy } = nextTweet;
    if (likedBy.size === 1) {
      res.status(200).json({ tweet: newTweet[0] });
      return;
    }
    const users = await getAllUsersInSet(likedBy);
    if (!users || users.length === 0) {
      res.status(200).json({ tweet: newTweet[0] });
      return;
    }
    const userPromises = users.map((user) => {
      if (!user.profileImageUpdated) {
        return user;
      }
      return signedProfileImage(user);
    });
    const newUsers = await Promise.all(userPromises);
    const likedUsers: LikedUser[] = [];
    newUsers.map((user) =>
      likedUsers.push({
        pk: user.id,
        sk: user.entityType,
        profileImage: user.profileImage,
      }),
    );
    res.status(200).json({ tweet: newTweet[0], likedUsers });
  } catch {
    res.status(500).send();
  }
};

export const getFavTweets = async (req: Request, res: Response) => {
  if (!req.session) {
    res.status(500).send();
    return;
  }
  if (!req.session.isAuth || !req.session.uid || !req.session.entityType) {
    res.status(401).send();
    return;
  }
  const pk = req.session.uid;
  try {
    const rawTweets = await getAllTweetsLikedByMe(pk);
    if (!rawTweets) {
      res.status(500).send();
      return;
    }
    const intTweets = rawTweets.map((tweet) => {
      const cp = { ...tweet }
      cp.doILike = true
      return cp;
    })
    const tweets = await populateTweetsProfileImage(intTweets);
    if (!tweets) {
      res.status(500).send();
      return;
    }
    tweets.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    const newTweets = await signImagesForTweets(tweets);
    res.status(200).json({ tweets: newTweets });
  } catch {
    res.status(500).send();
  }
};
