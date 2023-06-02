import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { Box } from '@mui/material';

const TweetImageList = (props: {imageData: string[]}) => {
  return (
    <ImageList cols={2} variant='masonry' >
      {props.imageData.map((item, idx) => (
        <ImageListItem key={item}>
          <Box
            key={idx}
            sx={{
              maxWidth:{
                xl: "40vw",
                lg: "60vw",
                md: "70vw",
                sm: "35vw",
                xs: "40vw",
              },
              maxHeight:{
                md:"20vh"
              }
            }}
            component="img"
            src={`${item}`}
            srcSet={`${item}`}
            loading="lazy"
            alt=""
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
}

export default TweetImageList;