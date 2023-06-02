import * as React from "react";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
const Footer = () => {
  const [value, setValue] = React.useState(0);
  return (
    <Box height="5vh" position="static"  maxWidth="100%">
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{
          backgroundColor: "black",
          color: "white"
        }}
      >
        <BottomNavigationAction onClick={() => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }} icon={<ArrowUpwardIcon sx={{color: "white"}}/>} />
      </BottomNavigation>
    </Box>
  );
};

export default Footer;
