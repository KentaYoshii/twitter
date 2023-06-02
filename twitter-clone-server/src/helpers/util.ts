import { randomUUID } from "crypto";
import { ImageEntity } from "../models/ImageEntity";

export const colors = [
  "black", "green", "yellow", "orange", "purple", "blue", "pink", "red", "white",
];

export const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua & Deps", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Rep", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Congo {Democratic Rep}", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland {Republic}", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea North", "Korea South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar, {Burma}", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russian Federation", "Rwanda", "St Kitts & Nevis", "St Lucia", "Saint Vincent & the Grenadines", "Samoa", "San Marino", "Sao Tome & Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad & Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export const genRandomUUID = (): string => randomUUID();

export const getPKFromSub = (sub: string): string => {
  const prefix = "User-";
  return `${prefix}${sub}`;
};

export const getSKFromUserName = (
  uname: string,
  sub: string,
  withSpace: boolean,
): string => {
  const prefix = "User-";
  if (withSpace) {
    const nameTokens = uname.split(" ");
    const name = nameTokens.join("");
    return `${prefix}${name}-${sub}`;
  }
  return `${prefix}${uname}-${sub}`;
};

export const getSKForTweet = (time: string, uname: string) => {
  const nameTokens = uname.split(" ");
  const name = nameTokens.join("");
  return `Tweet-${time}-${name}`;
}

export const getSKForFollowing = (followingId: string) =>
  `Following-${followingId}`;

export const getSKForFollowee = (followeeId: string) =>
  `Followee-${followeeId}`;

export const getSKForTimeline = (createdAt: string, posterSub: string) =>
  `Timeline-${createdAt}-${posterSub}`;

export const getEntityValueForTimeline = (
  createdAt: string,
  posterSub: string,
) => `Timeline-${posterSub}-${createdAt}`;

export const getKeysForImages = (pk: string, files: Express.Multer.File[]) =>
  files.map((file) => {
    const { originalname } = file;
    const timestamp = Date.now().toString();
    const key = `tweets/${pk}-${timestamp}-${originalname}`;
    return {
      key,
      file,
    } as ImageEntity;
  });
