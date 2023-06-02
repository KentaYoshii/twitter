import { Button, styled, TextField, Grid, Box } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React, { useState } from "react";
import { updateMe } from "../../utils/api/user.api";
import { countries } from "../../utils/const";
import { UserDataType } from "../../components/AuthLayout";

export const StyledTextField = styled(TextField)(({ theme }) => ({
  margin: "1rem",
  width: "300px",
}));

const EditForm = (props: {
  handleClose: () => void;
  setProfile: (user: UserDataType) => void;
}) => {
  const [country, setCountry] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [favColor, setFavColor] = useState("");

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    updateMe({
      country,
      introduction,
      favColor,
    })
      .then((updatedData) => {
        if (updatedData) {
          props.setProfile(updatedData);
        }
      })
      .catch(() => {});
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
      <FormControl
        style={{
          margin: "1rem",
          width: "300px",
        }}
        required
      >
        <InputLabel>Country</InputLabel>
        <Select
          variant="filled"
          value={country}
          label="Color"
          onChange={(e: SelectChangeEvent) => {
            setCountry(e.target.value as string);
          }}
        >
          {countries.map((country: string, idx) => (
            <MenuItem key={idx} value={country}>
              {country}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <StyledTextField
        label="Introduction"
        variant="filled"
        required
        inputProps={{maxLength: 100}}
        value={introduction}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setIntroduction(e.target.value)
        }
      />
      <FormControl
        style={{
          margin: "1rem",
          width: "300px",
        }}
        required
      >
        <InputLabel>Color</InputLabel>
        <Select
          variant="filled"
          value={favColor}
          label="Color"
          onChange={(e: SelectChangeEvent) => {
            setFavColor(e.target.value as string);
          }}
        >
          <MenuItem value="black">Black</MenuItem>
          <MenuItem value="green">Green</MenuItem>
          <MenuItem value="yellow">Yellow</MenuItem>
          <MenuItem value="orange">Orange</MenuItem>
          <MenuItem value="purple">Purple</MenuItem>
          <MenuItem value="blue">Blue</MenuItem>
          <MenuItem value="pink">Pink</MenuItem>
          <MenuItem value="red">Red</MenuItem>
          <MenuItem value="white">White</MenuItem>
        </Select>
      </FormControl>
      <Grid container>
        <Grid item xs={6}>
          <Box alignItems="center" justifyContent="space-evenly" display="flex">
            <Button
              variant="contained"
              sx={{ margin: "1rem" }}
              onClick={props.handleClose}
            >
              Cancel
            </Button>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box alignItems="center" justifyContent="space-evenly" display="flex">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{ margin: "1rem" }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default EditForm;
