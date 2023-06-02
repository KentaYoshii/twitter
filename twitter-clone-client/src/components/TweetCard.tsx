import { FC } from "react";
import Card from "@mui/joy/Card";
import { Typography } from "@mui/joy";
import {
  Avatar,
  Box,
  Divider,
  Grid,
  Link,
  Stack,
  IconButton,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import TweetEditPopover from "../pages/home/TweetEditPopover";
import { likeTweet } from "../utils/api/tweet.api";
import {
  fromIdAndUnameToHandle,
  convertFromUnixTimeDateTime,
} from "../utils/helper";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from '@mui/icons-material/Comment';
import { TweetEntity, useAuth } from "../hooks/useAuth";
import TweetCarousel from "./TweetCarousel";
import TweetImageList from "./ImageList";

export interface TweetCardInput {
  index: number;
  id: string;
  entityType: string;
  profileImage: string;
  textContent: string;
  username: string;
  createdAt: string;
  isEdited: boolean;
  canEdit: boolean;
  images: string[];
  doILike: boolean;
  likeCount: number;
  commentCount: number;
  myTweets: TweetEntity[];
  setMyTweets: (data: TweetEntity[]) => void;
}

const TweetCard: FC<TweetCardInput> = (props) => {
  const userAuth = useAuth();
  const me = userAuth.userData?.id === props.id;
  const theme = useTheme();
  const size = useMediaQuery(theme.breakpoints.up("md"));
  const onLike = () => {
    const prevState = props.doILike;
    const newState = !prevState;
    likeTweet(props.id, props.entityType, newState)
      .then((tweet) => {
        if (tweet) {
          console.log(tweet);
          props.myTweets.splice(props.index, 1);
          props.myTweets.splice(props.index, 0, tweet);
          props.setMyTweets([...props.myTweets]);
        }
      })
      .catch(() => {
        return null;
      });
  };
  return (
    <Box mb={3}>
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
        <Avatar src={props.profileImage} />
        <Grid container>
          <Grid item xs={6}>
            <Link
              href={
                me
                  ? "/dashboard/profile/me"
                  : `/dashboard/profile/${fromIdAndUnameToHandle(
                      props.id,
                      props.username
                    )}`
              }
            >
              <Typography level="h2" fontSize="lg" noWrap>
                {props.username}
              </Typography>
            </Link>
          </Grid>
          <Grid item xs={6}>
            {props.canEdit ? (
              <Box justifyContent="end" display="flex">
                <TweetEditPopover
                  for={props}
                  myTweets={props.myTweets}
                  setMyTweets={props.setMyTweets}
                />
              </Box>
            ) : (
              <></>
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography
              level="body2"
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
              {convertFromUnixTimeDateTime(props.createdAt)}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography
              sx={{
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
              noWrap
              mb={2}
            >
              {props.textContent}{" "}
              {props.isEdited ? (
                <Typography level="body2" fontWeight="light">
                  (Edited)
                </Typography>
              ) : (
                ""
              )}
            </Typography>
          </Grid>
          {props.images.length !== 0 && (
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
                  <TweetImageList imageData={props.images} />
                ) : (
                  <TweetCarousel images={props.images} />
                )}
              </Box>
            </Grid>
          )}
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={6} maxWidth={"inherit"}>
            <Box
              alignItems="center"
              display="flex"
              justifyContent="left"
            >
              <Stack direction={"row"} spacing={0.5}>
                <IconButton onClick={onLike}>
                  {props.doILike ? (
                    <FavoriteIcon color="error" />
                  ) : (
                    <FavoriteIcon color="disabled" />
                  )}
                </IconButton>
                <Typography paddingTop={1} paddingRight={1}>{props.likeCount}</Typography>
                <IconButton disabled color="info">
                  <CommentIcon />
                </IconButton>
                <Typography paddingTop={1}>{props.commentCount}</Typography>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              alignItems="center"
              display="flex"
              justifyContent="right"
              mt={1}
            >
              <Link
                href={`/dashboard/${props.id}/status/${props.entityType}`}
                underline="none"
              >
                Learn more
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default TweetCard;
