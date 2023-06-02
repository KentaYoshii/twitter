import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import GoogleButton from "react-google-button";
import background from "../../assets/bg.jpg";
import { Grid } from "@mui/material";

const defaultTheme = createTheme();

export default function LoginPage() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid
        container
        component="main"
        sx={{
          height: "93vh",
          backgroundImage: `url(${background})`,
          backgroundRepeat: "no-repeat",
          backgroundColor: (t) =>
            t.palette.mode === "light"
              ? t.palette.grey[50]
              : t.palette.grey[900],
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <CssBaseline />
        <Grid item xs={12} marginTop={10}>
          <Box alignItems="center" justifyContent="center" display="flex">
            <Typography
              color="white"
              sx={{
                typography: {
                  xl: "h1",
                  lg: "h1",
                  md: "h1",
                  sm: "h2",
                  xs: "h4",
                },
              }}
            >
              Twitter Clone
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box alignItems="center" justifyContent="center" display="flex">
            <Typography
              color="white"
              textAlign="center"
              sx={{
                typography: {
                  xl: "h3",
                  lg: "h3",
                  md: "h4",
                  sm: "h5",
                  xs: "h6",
                },
              }}
            >
              We believe real change starts with conversation.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box alignItems="center" justifyContent="center" display="flex">
            <GoogleButton
              onClick={() => {
                if (process.env.NODE_ENV === "production") {
                  window.location.href = "/auth";
                } else {
                  window.location.href = "http://localhost:7000/auth";
                }
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
