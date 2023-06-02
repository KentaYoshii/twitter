import axios from "axios";
import { TweetEntity } from "../../hooks/useAuth";

interface Timeline {
  // for this user
  id: string;
  entityType: string, // Timeline-<timestamp>-userName
  entityValue: string, 
  posterId: string,
  userName: string,  // poster
  content: string,
  createdAt: string,
  profileImage: string,
  entity: string,
  isEdited: boolean,
  images: string[],
  doILike: boolean,
  likeCount: number,
  tweetEntityType: string,
  commentCount: number,
}

export const getTweet = async (
  id: string,
  entityType: string,
) => {
  try {
    const tweet = await axios.get(`/tweets/${id}/${entityType}`, { withCredentials: true});
    console.log(tweet.data.tweet.comments)
    return tweet.data;
  } catch {
    return null;
  }
};

export const fetchUserTweets = async (): Promise<TweetEntity[] | null> => {
  try {
    const tweet = await axios.get("/tweets/me", { withCredentials: true });
    return tweet.data.tweets;
  } catch {
    return null;
  }
};

export const fetchAllOtherTweets = async (): Promise<TweetEntity[] | null> => {
  try {
    const tweet = await axios.get("/tweets/", { withCredentials: true });
    return tweet.data;
  } catch {
    return null;
  }
}

export const likeTweet = async (
  pk: string,
  sk: string,
  isLike: boolean,
) => {
  try {
    const res = await axios.put(
      "/tweets",
      { pk, sk, isLike },
      { withCredentials: true },
    );
    return res.data;
  } catch {
    return null;
  }
}

export const updateTweet = async (
  pk: string,
  sk: string,
  content: string,
): Promise<TweetEntity | null> => {
  try {
    const res = await axios.put(
      "/tweets/me",
      { pk, sk, content },
      { withCredentials: true }
    );
    return res.data
  } catch {
    return null;
  }
};

export const postTweet = async (
  content: string, images: FileList | undefined,
): Promise<TweetEntity | null> => {
  try {
    const fd = new FormData();
    fd.append("content", content);
    if (images) {
      for (let i = 0; i < images.length; i++) {
        fd.append(`file${i}`, images[i]);
      }
    };
    const tweet = await axios.post(
      "/tweets/me",
      fd,
      { 
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true 
      }
    );
    return tweet.data;
  } catch {
    return null;
  }
};

export const removeTweet = async (pk: string, sk: string) => {
  try {
    await axios.delete("/tweets/me", {
      data: {
        pk,
        sk,
      },
      withCredentials: true
    });
  } catch {
    return null;
  }
};

export const addComment = async (
  tweetPK: string,
  tweetSK: string,
  posterPK: string, 
  posterSK: string, 
  profileImage: string, // of the commenter
  posterName: string, // of the commenter
  content: string,
  ) => {
    try {
      const tweet = await axios.post("/tweets/comments", {
        tweetPK, tweetSK, posterPK, posterSK, profileImage, posterName, content,
      });
      return tweet.data; 
    } catch {
      return null;
    }
  };

export const getMyTimeline = async () => {
  try {
    const res = await axios.get("/tweets/personal", { withCredentials: true })
    const data = res.data;
    const tweets: TweetEntity[] = [];
    for (const tweet of data as Timeline[]) {
      tweets.push({
        id: tweet.posterId,
        // edited
        entityType: tweet.tweetEntityType,
        entityValue: tweet.entityValue,
        userName: tweet.userName,
        content: tweet.content,
        createdAt: tweet.createdAt,
        profileImage: tweet.profileImage,
        entity: tweet.entity,
        isEdited: tweet.isEdited,
        images: tweet.images,
        doILike: tweet.doILike,
        likeCount: tweet.likeCount,
        comments: [],
        commentCount: tweet.commentCount,
      })
    }
    return tweets;
  } catch {
    return null;
  }
}

export const getAllTweetsILike = async (
) => {
  try {
    const res = await axios.get("/tweets/liked", { withCredentials: true });
    return res.data.tweets;
  } catch {
    return null;
  }
}