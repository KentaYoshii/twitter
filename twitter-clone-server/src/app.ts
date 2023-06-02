/* eslint-disable import/first */
import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import asyncHandler from "express-async-handler";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import multer from "multer";
import session from "express-session";
import { createClient } from "redis";
import RedisStore from "connect-redis";

dotenv.config();

import * as UserController from "./controllers/user.controller";
import * as HomeController from "./controllers/home.controller";
import * as OidcController from "./controllers/oidc.controller";
import * as TweetController from "./controllers/tweet.controller";
import * as ImageController from "./controllers/image.controller";

import config from "./config";

// Create server
const app = express();

// Start in-memory db
export const redisClient = createClient();
redisClient.connect().catch((e) => {
  console.log(e);
});

app.set("port", config.PORT);

app.use(express.static(path.join(__dirname, "..", "build")));

// Middlewares
app.use(morgan("tiny"));
app.use(express.json());

// Multar middleware
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter(_req, file, cb) {
    if (file.mimetype.split("/")[0] === "image") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: { fileSize: 1000000000 },
});

const tweetUpload = upload.fields([
  { name: "content", maxCount: 1 },
  { name: "file0", maxCount: 1 },
  { name: "file1", maxCount: 1 },
  { name: "file2", maxCount: 1 },
  { name: "file3", maxCount: 1 },
]);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    store: new RedisStore({ client: redisClient }),
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 30 },
  }),
);

// Define Routers

// User-related
app.get("/hello", HomeController.getHome);
app.get("/user", asyncHandler(UserController.getAllUsers));
app.get("/user/me", asyncHandler(UserController.getCurUser));
app.post("/user/me", asyncHandler(UserController.updateCurUser));
app.get("/user/:handle", asyncHandler(UserController.getUser));

// Oauth2
app.get("/auth", OidcController.sendAuthorizationUrl);
app.post("/auth/logout", OidcController.handleLogout);
app.get("/auth/callback", asyncHandler(OidcController.handleRedirect));

// Tweets
app.get("/tweets/:id/:entityType", asyncHandler(TweetController.getTweetByPK))
app.get("/tweets", asyncHandler(TweetController.getAllOtherTweets));
app.get("/tweets/personal", asyncHandler(TweetController.getPersonalTweets));
app.get("/tweets/me", asyncHandler(TweetController.getMyTweets));
app.get("/tweets/liked", asyncHandler(TweetController.getFavTweets));
app.post(
  "/tweets/me",
  tweetUpload,
  asyncHandler(TweetController.createMyTweet),
);
app.delete("/tweets/me", asyncHandler(TweetController.deleteMyTweet));
app.put("/tweets/me", asyncHandler(TweetController.updateMyTweet));
app.put("/tweets", asyncHandler(TweetController.likeTweet));
app.post("/tweets/comments", asyncHandler(TweetController.addComment))
// Relations
app.post("/follow", asyncHandler(UserController.followUser));
app.delete("/follow", asyncHandler(UserController.unFollowUser));

// Image
app.post(
  "/image",
  upload.single("image"),
  asyncHandler(ImageController.setProfileImage),
  
);

app.get(
  "*",
  asyncHandler((_req: Request, res: Response) =>
    res.sendFile(
      path.join(__dirname, "..", "build", "index.html"),
    ),
  ),
);

export default app;
