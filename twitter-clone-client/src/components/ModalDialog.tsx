import { Dialog } from "@mui/material";
import Form from "../pages/profile/EditForm";
import TweetForm from "../pages/home/TweetModal";
import TweetEditModal from "../pages/home/TweetEditModal";
import { TweetCardInput } from "./TweetCard";
import { UserDataType } from "./AuthLayout";
import { TweetEntity } from "../hooks/useAuth";

const ModalDialog = (props: {
  open: boolean;
  handleClose: () => void;
  isTweet: boolean;
  isEdit: boolean;
  tweet: TweetCardInput | null;
  setProfile: (data: UserDataType) => void;
  myTweets: TweetEntity[];
  setMyTweets: (data: TweetEntity[]) => void;
}) => {
  return (
    <Dialog open={props.open} onClose={props.handleClose}>
      {props.isTweet ? (
        props.isEdit && props.tweet ? (
          <TweetEditModal handleClose={props.handleClose} tweet={props.tweet} myTweets={props.myTweets} setMyTweets={props.setMyTweets}/>
        ) :
          (
          <TweetForm handleClose={props.handleClose} />
          )
      ) : (
        <Form handleClose={props.handleClose} setProfile={props.setProfile}/>
      )}
    </Dialog>
  );
};

export default ModalDialog;
