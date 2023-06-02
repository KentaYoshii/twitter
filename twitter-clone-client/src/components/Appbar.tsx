import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { useAuth } from "../hooks/useAuth";
import { handleLogout } from "../utils/api/auth.api";
import { Navigate } from "react-router-dom";

type Props = {
  pages: Array<string>;
  paths: Array<string>;
};

const ResponsiveAppBar: React.FC<Props> = ({ pages, paths }) => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const userAuth = useAuth();
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  return (
    <AppBar position="static" style={{ background: "black", height: "7vh" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              marginRight: 10,
            }}
          >
            Twitter Clone
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page: string, idx) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Button
                    href={paths[idx]}
                    sx={{
                      color: "inherit",
                      textAlign: "center",
                    }}
                  >
                    {page}
                  </Button>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Twitter Clone
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page: string, idx) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                href={paths[idx]}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page}
              </Button>
            ))}
          </Box>
          {userAuth.isLogin ? (
            <Box sx={{ flexGrow: 0 }}>
              <Button
                onClick={() => {
                  // For logout, just set the ctx variables to ""
                  // After this, they can only access NON-PROTECTED pages
                  userAuth.setIsLogin(false);
                  userAuth.setUserData(null);
                  localStorage.clear();
                  handleLogout().then((loc) => {
                    <Navigate to={loc} />;
                  });
                }}
                color="inherit"
              >
                Logout
              </Button>
            </Box>
          ) : (
            <></>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
