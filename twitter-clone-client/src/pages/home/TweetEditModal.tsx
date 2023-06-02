import { Button, styled, TextField, Grid, Box } from "@mui/material";
import React, { useState } from "react";
import { TweetCardInput } from "../../components/TweetCard";
import { TweetEntity } from "../../hooks/useAuth";
import { updateTweet } from "../../utils/api/tweet.api";

export const StyledTextField = styled(TextField)(({ theme }) => ({
    margin: "1rem",
    width: "300px",
}));

const TweetEditModal = (props: { handleClose: () => void, tweet: TweetCardInput, myTweets: TweetEntity[], setMyTweets: (data: TweetEntity[]) => void }) => {
    const [content, setContent] = useState(props.tweet.textContent);

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        updateTweet(props.tweet.id, props.tweet.entityType, content).then((tweet) => {
            if (tweet) {
                props.myTweets.splice(props.tweet.index, 1);
                props.myTweets.splice(props.tweet.index, 0, tweet);
                props.setMyTweets([...props.myTweets]);
            }
        });

        props.handleClose();
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem",
            }}
        >
            <StyledTextField
                multiline={true}
                label="What's happening?"
                variant="filled"
                fullWidth
                rows={4}
                inputProps={{ maxLength: 280 }}
                required
                value={content}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setContent(e.target.value)
                }
            />
            <Grid container>
                <Grid item xs={6}>
                    <Box justifyContent="center" alignItems="center" display="flex">
                        <Button
                            variant="contained"
                            sx={{ margin: "1rem" }}
                            onClick={props.handleClose}
                        >
                            Return
                        </Button>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box justifyContent="center" alignItems="center" display="flex">
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            sx={{ margin: "1rem" }}
                            onClick={handleSubmit}
                        >
                            Tweet
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </form>
    );
};

export default TweetEditModal;
