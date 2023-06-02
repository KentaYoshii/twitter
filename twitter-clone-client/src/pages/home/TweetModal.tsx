// import { Button, styled, TextField, Grid, Box } from "@mui/material";
// import React, { useState } from "react";
// import { useAuth } from "../../hooks/useAuth";
// import { postTweet } from "../../utils/api/tweet.api";

// export const StyledTextField = styled(TextField)(({ theme }) => ({
//   margin: "1rem",
//   width: "300px",
// }));

const TweetForm = (props: { handleClose: () => void }) => {
//   const [content, setContent] = useState("");
//   const userAuth = useAuth();

//   const handleSubmit = (e: React.SyntheticEvent) => {
//     e.preventDefault();
//     if (content !== "") {
//       postTweet(content,).then((tweet) => {
//         if (tweet) {
//           userAuth.setMyTweets([tweet, ...userAuth.myTweets]);
//         }
//       });
//     }
//     props.handleClose();
//   };

  return (
//     <form
//       onSubmit={handleSubmit}
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         padding: "2rem",
//       }}
//     >
//       <StyledTextField
//         multiline={true}
//         label="What's happening?"
//         variant="filled"
//         fullWidth
//         rows={4}
//         inputProps={{ maxLength: 280 }}
//         required
//         value={content}
//         onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//           setContent(e.target.value)
//         }
//       />
//       <Grid container>
//         <Grid item xs={6}>
//           <Box justifyContent="center" alignItems="center" display="flex">
//             <Button
//               variant="contained"
//               sx={{ margin: "1rem" }}
//               onClick={props.handleClose}
//             >
//               Return
//             </Button>
//           </Box>
//         </Grid>
//         <Grid item xs={6}>
//           <Box justifyContent="center" alignItems="center" display="flex">
//             <Button
//               variant="contained"
//               color="primary"
//               type="submit"
//               sx={{ margin: "1rem" }}
//               onClick={handleSubmit}
//             >
//               Tweet
//             </Button>
//           </Box>
//         </Grid>
//       </Grid>
//     </form>
  <></>);
};

export default TweetForm;