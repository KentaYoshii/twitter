// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useAuth } from "../../hooks/useAuth";
import { convertFromUnixTime } from "../../utils/helper";
import ModalDialog from "../../components/ModalDialog";
import UploadButtons from "./UploadButton";
import { useParams, Navigate } from "react-router-dom";
import { UserDataType } from "../../components/AuthLayout";
import {
  fetchOtherUser,
  unFollowUser,
  followUser,
} from "../../utils/api/user.api";

const Profile = () => {
  const { handle } = useParams();
  const { userData } = useAuth();
  const [profile, setProfile] = useState<UserDataType | null>(userData);
  const [open, setOpen] = useState(false);
  const [followState, setFollowState] = useState(false);
  useEffect(() => {
    if (handle === "me" || !handle) {
      setProfile(userData);
    } else {
      fetchOtherUser(handle).then((user) => {
        if (user) {
          setProfile(user);
          setFollowState(user.following);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!profile) {
    return <Navigate to={"/"} />;
  }
  //For EditForm Modal
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const isOther = handle !== "me";

  return (
    <Box
      style={{ minHeight: "88vh" }}
      justifyContent="center"
      alignItems="center"
      display="flex"
      flexDirection="column"
    >
      <Container maxWidth="sm">
        <Grid
          container
          item
          xs={12}
          justifyContent="center"
          mx="auto"
          border={10}
          borderColor={profile.favColor}
          sx={{
            backgroundColor: "white",
            borderRadius: "100px",
          }}
        >
          <Box textAlign="center" paddingTop={5} mb={0.5}>
            <Avatar
              src={profile.profileImage}
              sx={{
                width: {
                  xs: "80px",
                  sm: "100px",
                  md: "120px",
                  lg: "140px",
                  xl: "160px",
                },
                height: {
                  xs: "80px",
                  sm: "100px",
                  md: "120px",
                  lg: "140px",
                  xl: "160px",
                },
              }}
            />
            {!isOther && <UploadButtons profile={profile} setProfile={setProfile}/>}
          </Box>
          <Grid container justifyContent="center" py={6} paddingTop={-10}>
            <Grid
              item
              xs={12}
              md={7}
              mx={{ xs: "auto", sm: 6, md: 1 }}
              padding={1.5}
            >
              <Box
                display="flex"
                justifyContent="space-evenly"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h4">{profile.entityValue}</Typography>
                {isOther ? (
                  followState ? (
                    <Button
                      variant="outlined"
                      color="info"
                      size="small"
                      onClick={() => {
                        unFollowUser(profile).then((suc) => {
                          if (suc) {
                            setFollowState(!followState);
                          }
                        });
                      }}
                    >
                      Unfollow
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      onClick={() => {
                        followUser(profile).then((suc) => {
                          if (suc) {
                            setFollowState(!followState);
                          }
                        });
                      }}
                    >
                      Follow
                    </Button>
                  )
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={handleOpen}
                      size="small"
                    >
                      Edit
                    </Button>
                    <ModalDialog
                      open={open}
                      handleClose={handleClose}
                      isTweet={false}
                      isEdit={false}
                      tweet={null}
                      setProfile={setProfile}
                      myTweets={[]}
                      setMyTweets={()=>null}
                    />
                  </>
                )}
              </Box>
              <Grid
                container
                item
                spacing={2}
                mb={3}
                justifyContent="space-evenly"
              >
                <Grid item>
                  <Typography
                    component="span"
                    variant="body2"
                    fontWeight="bold"
                  >
                    {profile.tweetCount}&nbsp;
                  </Typography>
                  <Typography component="span" variant="body2" color="text">
                    Tweets
                  </Typography>
                </Grid>
                <Grid item>
                  <Divider orientation="vertical" />
                </Grid>
                <Grid item>
                  <Typography
                    component="span"
                    variant="body2"
                    fontWeight="bold"
                  >
                    {profile.followerCount}&nbsp;
                  </Typography>
                  <Typography component="span" variant="body2" color="text">
                    Followers
                  </Typography>
                </Grid>
                <Grid item>
                  <Divider orientation="vertical" />
                </Grid>
                <Grid item>
                  <Typography
                    component="span"
                    variant="body2"
                    fontWeight="bold"
                  >
                    {profile.followingCount}&nbsp;
                  </Typography>
                  <Typography component="span" variant="body2" color="text">
                    Following
                  </Typography>
                </Grid>
              </Grid>
              <Grid container item justifyContent="space-evenly" mb={3}>
                <Grid item>
                  {profile.country ? (
                    <Typography variant="caption">{profile.country}</Typography>
                  ) : (
                    <Typography variant="caption">
                      {isOther ? "From somewhere ..." : "Share where you are from!"}
                    </Typography>
                  )}
                </Grid>
                <Grid item>
                  <Divider orientation="vertical" />
                </Grid>
                <Grid item>
                  <Typography variant="caption">
                    {`Joined ${convertFromUnixTime(profile.createdAt)}`}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container item>
                <Grid item xs={12}>
                  <Box
                    justifyContent="center"
                    alignItems="center"
                    display="flex"
                  >
                    <Typography
                      variant="body2"
                      fontWeight="light"
                      color="text"
                      mb={3}
                      gutterBottom
                    >
                      {profile.introduction
                        ? profile.introduction
                        : isOther
                        ? "This user has no introduction...😅"
                        : "Edit your profile to add an introduction!"}
                      <br />
                    </Typography>
                  </Box>
                </Grid>
                {isOther && profile.followed && (
                  <>
                    <Grid item xs={12}>
                      <Box
                        justifyContent="center"
                        alignItems="center"
                        display="flex"
                      >
                        <Typography variant="caption" color="primary">
                          Following you
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;
