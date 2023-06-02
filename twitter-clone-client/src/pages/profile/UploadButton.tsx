import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import Stack from "@mui/material/Stack";
import React from "react";
import { sendProfileImage } from "../../utils/api/image.api";
import { UserDataType } from "../../components/AuthLayout";

const Input = styled("input")({
  display: "none",
});

const UploadButtons = (props: {profile: UserDataType, setProfile: (data: UserDataType) => void}) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const fd = new FormData()
    fd.append("image", file);
    const img = await sendProfileImage(fd);
    const cpUser = { ...props.profile }
    cpUser.profileImage = img;
    props.setProfile(cpUser);
  };

  return (
    <Stack alignItems="center">
      <label htmlFor="icon-button-file">
        <Input
          accept="image/*"
          id="icon-button-file"
          type="file"
          onChange={handleFileUpload}
        />
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="span"
        >
          <AddPhotoAlternateOutlinedIcon />
        </IconButton>
      </label>
    </Stack>
  );
};

export default UploadButtons;
