import React, { useState } from "react";
import { Button, Popover, Grid } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { TweetCardInput } from "../../components/TweetCard";
import { removeTweet } from "../../utils/api/tweet.api";
import { TweetEntity } from "../../hooks/useAuth";
import ModalDialog from "../../components/ModalDialog";

const TweetEditPopover = (props: {
  for: TweetCardInput;
  myTweets: TweetEntity[];
  setMyTweets: (data: TweetEntity[]) => void;
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //For TweetForm Modal
  const [openEditModal, setOpenEditModal] = useState(false);

  const handleEditOpen = () => {
    setOpenEditModal(true);
  };

  const handleEditClose = () => {
    setOpenEditModal(false);
  };

  const handleDeleteClick = () => {
    removeTweet(props.for.id, props.for.entityType)
      .then(() => {
        props.myTweets.splice(props.for.index, 1);
        props.setMyTweets([...props.myTweets]);
      })
      .catch();
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <Button aria-describedby={id} onClick={handleClick}>
        <EditIcon color="action" fontSize="small" />
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          style: { width: "63px" },
        }}
      >
        <Grid container>
          <Grid item xs={12}>
            <Button onClick={handleEditOpen}>Edit</Button>
            <ModalDialog
              open={openEditModal}
              handleClose={handleEditClose}
              isTweet={true}
              isEdit={true}
              tweet={props.for}
              setProfile={() => null}
              myTweets={props.myTweets}
              setMyTweets={props.setMyTweets}
            />
          </Grid>
          <Grid item xs={12}>
            <Button onClick={handleDeleteClick}>Delete</Button>
          </Grid>
        </Grid>
      </Popover>
    </div>
  );
};

export default TweetEditPopover;
