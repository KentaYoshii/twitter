import { google } from "googleapis";
import { z } from "zod";
import config from "./config";

const UserTokenSchema = z.object({
  sub: z.string(),
  email: z.string(),
  name: z.string(),
  picture: z.string(),
});

export type UserToken = z.infer<typeof UserTokenSchema>;

export const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  config.GOOGLE_REDIRECT_URI,
);
// scope = openid, profile, email
const scopes = ["email", "profile", "openid"];

// Given a Auth Code, gets a decode token information
export const getTokenFromCode = async (
  code: string,
): Promise<UserToken | null> => {
  // Get Token for this client
  const clientData = await oauth2Client.getToken(code);
  const jwt = clientData.tokens.id_token;
  if (typeof jwt !== "string") {
    return null;
  }
  try {
    const tokenInfo = await oauth2Client.verifyIdToken({ idToken: jwt });
    const payload = tokenInfo.getPayload();
    if (!payload) {
      return null;
    }
    const userToken = UserTokenSchema.parse(payload);
    return userToken;
  } catch (err: unknown) {
    return null;
  }
};

// Generate a url that asks permissions for the Drive activity scope
export const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  // Enable incremental authorization. Recommended as a best practice.
  include_granted_scopes: true,
});
