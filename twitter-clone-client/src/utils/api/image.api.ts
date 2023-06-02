import axios from "axios";

export const sendProfileImage = async (fd: FormData) => {
  try {
    const res = await axios.post("/image", fd, { 
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true
    });
    return res.data.location;
  } catch (e) {
    console.log(e);
    return null;
  }  
};