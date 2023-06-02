import axios from 'axios';

export const handleLogout = async () => {
  const endpoint = "/auth/logout";
  try {
    const res = await axios.post(endpoint, null, { withCredentials: true });
    return res.data.locaton;
  } catch (e) {
    console.log(e);
  }
}