import Button from "@mui/material/Button";

const TweetImageUpload = (props: {images: FileList | undefined, setImages: (data: FileList | undefined) => void}) => {
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      props.setImages(undefined);
      return;
    }
    const cnt = Array.from(e.target.files).length;
    if (cnt > 4) {
      e.preventDefault();
      alert(`Cannot upload more than 4 files`)
      props.setImages(undefined);
      return;
    }
    props.setImages(e.target.files)
  };

  return (
    <Button
      component="label"
      color="primary"
      size="small"
      variant="outlined"
      sx={{
        borderRadius: "20px",
      }}
    >
      Upload
      <input
        accept="image/*"
        multiple
        type="file"
        max={4}
        hidden
        onChange={handleChange}
      >
      </input>
    </Button>
  );
};

export default TweetImageUpload;
