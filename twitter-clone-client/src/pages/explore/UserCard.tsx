import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import { UserDataType } from "../../components/AuthLayout";
import { convertFromUnixTime } from "../../utils/helper";
import { followUser, unFollowUser } from "../../utils/api/user.api";
import { Link } from "react-router-dom";

const UserCard = (props: { user: UserDataType }) => {
  const [followState, setFollowState] = React.useState(props.user.following);
  return (
    <Card
      sx={{
        maxWidth: {
          xs: "80vw",
          sm: "70vw",
          md: "45vw",
          lg: "40vw",
        },
        width: {
          xs: "80vw",
          sm: "70vw",
          md: "50vw",
          lg: "30vw",
        },
        margin: "0 auto",
        padding: "0.1em",
        boxShadow: `3px 3px 5px 3px ${props.user.favColor}`,
      }}
    >
      <Grid container>
        <Grid item xs={12} md={5} lg={4}>
          <Box justifyContent="center" alignItems="center" display="flex">
            <CardMedia
              image={props.user.profileImage}
              sx={{
                height: {
                  xs: "20vw",
                  sm: "15vw",
                  md: "10vw",
                  lg: "7.5vw",
                  xl: "6vw",
                },
                margin: "0.5vw",
                borderRadius: "50%",
                width: {
                  xs: "20vw",
                  sm: "15vw",
                  md: "10vw",
                  lg: "7.5vw",
                  xl: "6vw",
                },
              }}
            />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={7}
          lg={8}
          justifyContent={{ xs: "center", md: "left" }}
          alignItems={{ xs: "center", md: "left" }}
          display="flex"
        >
          <CardContent>
            <Typography gutterBottom variant="h5">
              {props.user.entityValue} <br />
              <Typography variant="caption" color="text.secondary">
                {`Joined ${convertFromUnixTime(props.user.createdAt)}`}
                {props.user.followed ? " | Following you" : <></>}
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {props.user.introduction}
            </Typography>
          </CardContent>
        </Grid>
      </Grid>
      <CardActions>
        <Grid container spacing={2}>
          {followState ? (
            <Grid item xs={6}>
              <Box alignItems="center" display="flex" justifyContent="right">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    unFollowUser(props.user).then((suc) => {
                      if (suc) {
                        setFollowState(false);
                      }
                    });
                  }}
                >
                  Unfollow
                </Button>
              </Box>
            </Grid>
          ) : (
            <Grid item xs={6}>
              <Box alignItems="center" display="flex" justifyContent="right">
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    followUser(props.user).then((suc) => {
                      if (suc) {
                        setFollowState(true);
                      }
                    });
                  }}
                >
                  Follow
                </Button>
              </Box>
            </Grid>
          )}
          <Grid item xs={6}>
            <Box alignItems="center" display="flex" justifyContent="left">
              <Button
                size="small"
                variant="contained"
                component={Link}
                to={`/dashboard/profile/${props.user.entityType}`}
              >
                Learn More
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default UserCard;
