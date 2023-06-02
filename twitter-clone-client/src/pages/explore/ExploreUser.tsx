import { Box } from "@mui/material";
import { UserDataType } from "../../components/AuthLayout";
import UserCard from "./UserCard";

const ExploreUser = (props: {user: UserDataType, index: number}) => {
  return (
    <Box justifyContent="center" display="flex" alignItems="center">
      <UserCard key={props.index} user={props.user}/>
    </Box>
  );
};

export default ExploreUser;
