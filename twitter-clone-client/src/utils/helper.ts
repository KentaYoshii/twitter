export const convertFromUnixTime = (input: string): string => {
  const date = new Date(Number(input));
  return date.toLocaleDateString("default");
};

export const convertFromUnixTimeDateTime = (input: string): string => {
  const date = new Date(Number(input));
  return `${date.toLocaleDateString("default")} ${date.toLocaleTimeString(
    "default"
  )}`;
};

export const fromIdAndUnameToHandle = (id: string, uname: string): string => {
  const idSplit = id.split("-");
  const split = uname.split(" ");
  const full = split.join("");
  return `User-${full}-${idSplit[1]}`;
};
