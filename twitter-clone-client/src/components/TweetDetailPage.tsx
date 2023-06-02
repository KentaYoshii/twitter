import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Card from "@mui/joy/Card";
import { getTweet, addComment } from "../utils/api/tweet.api";
import {
  Avatar,
  Box,
  Typography,
  Grid,
  Link,
  AvatarGroup,
  TextField,
  Button,
  Divider,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  fromIdAndUnameToHandle,
  convertFromUnixTimeDateTime,
} from "../utils/helper";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { TweetEntity, useAuth } from "../hooks/useAuth";
import TweetCarousel from "./TweetCarousel";
import TweetImageList from "./ImageList";
import CommentsTimeline from "./CommentsTimeline";

interface LikedUsers {
  pk: string;
  sk: string;
  profileImage: string;
}

export interface Comment {
  content: string;
  createdAt: string;
  posterName: string;
  posterPK: string;
  posterSK: string;
  profileImage: string;
  tweetPK: string;
  tweetSK: string;
}

const TweetDetailPage = () => {
  const { id, entityType } = useParams();
  const [myTweet, setMyTweet] = useState<TweetEntity | null>(null);
  const [users, setUsers] = useState<LikedUsers[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const userAuth = useAuth();
  const theme = useTheme();
  const size = useMediaQuery(theme.breakpoints.up("md"));
  useEffect(() => {
    if (!id || !entityType) {
      <Navigate to={"/"} />;
      return;
    }
    getTweet(id, entityType).then((data) => {
      const { tweet, likedUsers } = data;
      if (tweet) {
        setMyTweet(tweet);
        setUsers(likedUsers);
        setComments(tweet.comments);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const me = userAuth.userData!.id === id;
  if (!myTweet) {
    return (
      <Box minHeight="88vh">
        <Box justifyContent="center" display="flex" alignItems="center">
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={true}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        </Box>
      </Box>
    );
  }

  const handleAddComment = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (content !== "") {
      addComment(
        myTweet.id,
        myTweet.entityType,
        userAuth.userData!.id,
        userAuth.userData!.entityType,
        userAuth.userData!.profileImage,
        userAuth.userData!.entityValue,
        content
      )
        .then((data) => {
          const { tweet, likedUsers } = data;
          if (tweet) {
            setMyTweet(tweet);
            setUsers(likedUsers);
            setComments([...tweet.comments]);
            setContent("")
            return;
          }
        })
        .catch(() => {
          setContent("")
          return;
        });
    }
  };

  return (
    <Box minHeight="89vh">
      <Grid container mb={4}>
        <Grid item xs={12}>
          <Box
            alignItems="center"
            justifyContent="center"
            display="flex"
            mt={10}
          >
            <Card
              variant="outlined"
              orientation="horizontal"
              sx={{
                width: {
                  xs: "70vw",
                  sm: "80vw",
                  md: "80vw",
                  lg: "60vw",
                  xl: "45vw",
                },
                margin: 1,
                gap: 2,
                "&:hover": {
                  boxShadow: "md",
                  borderColor: "neutral.outlinedHoverBorder",
                },
              }}
            >
              <Avatar src={myTweet.profileImage} />
              <Grid container>
                <Grid item xs={6}>
                  <Link
                    color="black"
                    underline="none"
                    href={
                      me
                        ? "/dashboard/profile/me"
                        : `/dashboard/profile/${fromIdAndUnameToHandle(
                            myTweet.id,
                            myTweet.userName
                          )}`
                    }
                  >
                    <Typography variant="h2" fontSize="large">
                      {myTweet.userName}
                    </Typography>
                  </Link>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    fontWeight="light"
                    noWrap
                    sx={{
                      fontSize: {
                        lg: 17,
                        md: 15,
                        sm: 13,
                        xs: 10,
                      },
                    }}
                    mb={2}
                  >
                    {convertFromUnixTimeDateTime(myTweet.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      wordWrap: "break-word",
                      fontSize: {
                        lg: 17,
                        md: 15,
                        sm: 13,
                        xs: 12,
                      },
                      width: {
                        xs: "50vw",
                        sm: "70vw",
                        md: "72vw",
                        lg: "55vw",
                        xl: "40vw",
                      },
                    }}
                    mb={2}
                  >
                    {myTweet.content}{" "}
                    {myTweet.isEdited ? (
                      <Typography variant="body2" fontWeight="light">
                        (Edited)
                      </Typography>
                    ) : (
                      ""
                    )}
                  </Typography>
                </Grid>
                {myTweet.images.length !== 0 && (
                  <Grid item xs={12}>
                    <Box
                      mb={2}
                      maxWidth={{
                        xl: "40vw",
                        lg: "60vw",
                        md: "70vw",
                        sm: "35vw",
                        xs: "40vw",
                      }}
                      sx={{
                        justifyContent: "center",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {size ? (
                        <TweetImageList imageData={myTweet.images} />
                      ) : (
                        <TweetCarousel images={myTweet.images} />
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Card>
          </Box>
        </Grid>
        <Grid item xs={12} mt={4}>
          <Box
            alignItems="center"
            display="flex"
            justifyContent="center"
            mb={3}
          >
            <Typography fontFamily="inherit">Liked by</Typography>
          </Box>
          <Box
            alignItems="center"
            display="flex"
            justifyContent="center"
            mb={5}
          >
            {!users ? (
              <Typography>No one...😕</Typography>
            ) : (
              <AvatarGroup max={8}>
                {users &&
                  users.map((user, idx) => (
                    <Link
                      key={idx}
                      href={
                        userAuth.userData!.id === user.pk
                          ? "/dashboard/profile/me"
                          : `/dashboard/profile/${user.sk}`
                      }
                    >
                      <Avatar
                        key={idx}
                        src={user.profileImage}
                        sx={{
                          width: {
                            xl: "100px",
                          },
                          height: {
                            xl: "100px",
                          },
                        }}
                      />
                    </Link>
                  ))}
              </AvatarGroup>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} mb={4}>
          <Divider variant="middle" />
        </Grid>
        <Grid item xs={12}>
          <Box
            alignItems="center"
            display="flex"
            justifyContent="center"
            mb={3}
          >
            <TextField
              multiline={true}
              rows={2}
              label="Add a comment!"
              variant="outlined"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setContent(e.target.value)
              }
              inputProps={{ maxLength: 30 }}
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
        <Grid item xs={12} mb={3}>
          <Box alignItems="center" display="flex" justifyContent="center">
            <Button variant="outlined" onClick={handleAddComment}>
              Comment
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box alignItems="center" justifyContent="center" display="flex">
            <Typography fontFamily="inherit">Comments</Typography>
          </Box>
        </Grid>
        {comments.length === 0 ? (
          <Grid item xs={12} mt={3}>
            <Box alignItems="center" display="flex" justifyContent="center">
              <Typography>No comments yet...😐</Typography>
            </Box>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Box alignItems="center" display="flex" justifyContent="center">
              <CommentsTimeline comments={comments} />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TweetDetailPage;
