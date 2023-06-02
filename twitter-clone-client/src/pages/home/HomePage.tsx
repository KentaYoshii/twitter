import { useState, useEffect } from "react";
import { TweetEntity } from "../../hooks/useAuth";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  ImageList,
  ImageListItem,
  Divider,
} from "@mui/material";
import TweetCard from "../../components/TweetCard";
import { fetchUserTweets, postTweet } from "../../utils/api/tweet.api";
import TweetImageUpload from "./TweetImageUpload";

const HomePage = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<FileList>();
  const [previews, setPreviews] = useState<string[]>();
  const [myTweets, setMyTweets] = useState<TweetEntity[]>([]);

  useEffect(() => {
    fetchUserTweets().then((tweets: TweetEntity[] | null) => {
      if (tweets) {
        setMyTweets(tweets);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!images) {
      setPreviews(undefined);
      return;
    }
    const length = images.length;
    const objectUrls: string[] = [];
    for (let i = 0; i < length; i++) {
      const objectUrl = URL.createObjectURL(images[i]);
      objectUrls.push(objectUrl);
    }

    setPreviews(objectUrls);
    return () => {
      for (let i = 0; i < length; i++) {
        URL.revokeObjectURL(objectUrls[i]);
      }
    };
  }, [images]);

  const onClear = () => {
    setImages(undefined);
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (content !== "") {
      postTweet(content, images).then((tweet) => {
        if (tweet) {
          setMyTweets([tweet, ...myTweets]);
        }
      });
      setContent("");
      setImages(undefined);
    }
  };

  const handleKeySubmit = () => {
    if (content !== "") {
      postTweet(content, images).then((tweet) => {
        if (tweet) {
          setMyTweets([tweet, ...myTweets]);
        }
      });
      setContent("");
      setImages(undefined);
    }
  };

  return (
    <Box minHeight="88vh">
      <Grid container marginTop={10} spacing={2} marginBottom={10}>
        <Grid item xs={12}>
          <Box alignItems="center" justifyContent="center" display="flex">
            <TextField
              multiline={true}
              rows={2}
              label="What is happening?"
              variant="outlined"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setContent(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleKeySubmit();
                }
              }}
              inputProps={{ maxLength: 280 }}
              value={content}
              sx={{
                width: {
                  xs: "60vw",
                  sm: "70vw",
                  md: "70vw",
                  lg: "50vw",
                  xl: "35vw",
                },
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box alignItems="center" justifyContent="right" display="flex">
            <Button
              color="primary"
              size="small"
              variant="outlined"
              sx={{
                borderRadius: "20px",
              }}
              onClick={handleSubmit}
            >
              Tweet
            </Button>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box alignItems="center" justifyContent="left" display="flex">
            <TweetImageUpload images={images} setImages={setImages} />
          </Box>
        </Grid>
        {/* Show User the previews of image selected */}
        {images && previews && (
          <>
            <Grid item xs={12}>
              <Divider variant="middle" />
              <Box alignItems="center" justifyContent="center" display="flex">
                <Typography variant="body1" mt={3}>
                  Preview
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box alignItems="center" justifyContent="center" display="flex">
                <Box
                  sx={{
                    maxWidth: {
                      xs: "60vw",
                      sm: "70vw",
                      md: "70vw",
                      lg: "50vw",
                      xl: "30vw",
                    },
                    maxHeight: {
                      md: "20vh",
                    },
                  }}
                >
                  <ImageList sx={{ overflowX: "auto" }} gap={2}>
                    <ImageListItem
                      sx={{ display: "flex", flexDirection: "row" }}
                    >
                      {previews.map((preview, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          sx={{
                            maxWidth: {
                              xs: "60vw",
                              sm: "70vw",
                              md: "70vw",
                              lg: "50vw",
                              xl: "30vw",
                            },
                            maxHeight: {
                              md: "20vh",
                            },
                          }}
                          src={preview}
                        />
                      ))}
                    </ImageListItem>
                  </ImageList>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} mt={3}>
              <Box
                alignItems="center"
                justifyContent="center"
                display="flex"
                mb={3}
              >
                <Button variant="outlined" onClick={onClear}>
                  Clear
                </Button>
              </Box>
              <Divider variant="middle" />
            </Grid>
          </>
        )}
      </Grid>

      {/* Render Tweets */}
      <Box
        alignItems="center"
        justifyContent="center"
        display="flex"
        minHeight="34vh"
        sx={{
          backgroundSize: "cover",
        }}
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
              {myTweets.length === 0 ? (
                <Typography variant="h2" component="h2" color="black">
                  No tweets Yet!
                </Typography>
              ) : (
                myTweets.map((tweet: TweetEntity, idx) => (
                  <TweetCard
                    canEdit={true}
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
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default HomePage;
