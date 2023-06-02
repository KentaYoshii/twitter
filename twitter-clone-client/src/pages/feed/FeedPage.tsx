import { fetchAllOtherTweets, getAllTweetsILike, getMyTimeline } from "../../utils/api/tweet.api";
import { TweetEntity } from "../../hooks/useAuth";
import TweetCard from "../../components/TweetCard";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Grid, Typography } from "@mui/material";

const FeedPage = () => {
  const [value, setValue] = useState(0);
  const [myTweets, setMyTweets] = useState<TweetEntity[]>([]);
  useEffect(() => {
    if (value === 0) {
      fetchAllOtherTweets().then((tweets: TweetEntity[] | null) => {
        if (tweets) {
          setMyTweets([...tweets]);
        }
      });
    } else if (value === 1) {
      getMyTimeline().then((tweets: TweetEntity[] | null) => {
        if (tweets) {
          setMyTweets([...tweets]);
        }
      });
    } else {
      getAllTweetsILike()
        .then((tweets) => {
          if (tweets) {
            setMyTweets([...tweets]);
          }
        })
    }
  }, [value]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box style={{
      minHeight: "88vh"
    }}>
      <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="Global Feed" />
          <Tab label="Personal Feed" />
          <Tab label="Favorites" />
        </Tabs>
      </Box>
      <Box
        alignItems="center"
        justifyContent="center"
        display="flex"
        minHeight="34vh"
      >
        <Grid container justifyContent="space-evenly" spacing={2}>
          <Grid
            item
            xs={12}
            justifyContent="center"
            alignItems="center"
            display="flex"
          >
            <Box>
              <Box>
                {myTweets.length === 0 ? (
                  <Typography variant="h2" component="h2" color="black">
                    No tweets Yet!
                  </Typography>
                ) : (
                  myTweets.map((tweet: TweetEntity, idx) => (
                    <TweetCard
                      canEdit={false}
                      key={idx}
                      index={idx}
                      id={tweet.id}
                      entityType={tweet.entityType}
                      profileImage={tweet.profileImage}
                      textContent={tweet.content}
                      createdAt={tweet.createdAt}
                      username={tweet.userName}
                      isEdited={tweet.isEdited}
                      images={tweet.images}
                      doILike={tweet.doILike}
                      likeCount={tweet.likeCount}
                      myTweets={myTweets}
                      setMyTweets={setMyTweets}
                      commentCount={tweet.commentCount}
                    />
                  ))
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
export default FeedPage;
