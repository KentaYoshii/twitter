import { Box, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { UserDataType } from "../../components/AuthLayout";
import { fetchOtherUsers } from "../../utils/api/user.api";

import ExploreUser from "./ExploreUser";

const ExplorePage = () => {
  const [others, setOthers] = useState<UserDataType[]>([]);
  useEffect(() => {
    fetchOtherUsers()
      .then((usrs) => {
        if (usrs) {
          setOthers([...usrs]);
        }
      })
  }, [])

  return (
    <Box
      minHeight="92.5vh"
    >
      <Grid container spacing={2} rowSpacing={6}>
        <Grid item xs={12}>
          <Box justifyContent="center" alignItems="center" display="flex" mt="3vh">
            <Typography sx={{ typography: { sm: 'h3', xs: 'h4' } }}>
              Explore other users.
            </Typography>
          </Box>
        </Grid>
        {
          others.map((other: UserDataType, idx: number) => (
            <Grid item key={idx} xs={12} md={6} lg={4} mb={5}>
              <ExploreUser user={other} index={idx}/>
            </Grid>
          ))
        }
      </Grid>
    </Box>
  );
};
export default ExplorePage;
