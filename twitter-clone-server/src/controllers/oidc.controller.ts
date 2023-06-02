import type { Request, Response } from "express";

import { UserEntity } from "../models/UserEntity";
import { getUserByPK, registerUser } from "../database/db_user";
import { getPKFromSub, getSKFromUserName } from "../helpers/util";
import { authorizationUrl, getTokenFromCode } from "../oidc";
import config from "../config";

const loginUser = (req: Request, res: Response, entity: UserEntity) => {
  req.session.isAuth = true;
  req.session.uid = entity.id;
  req.session.entityType = entity.entityType;
  req.session.entityValue = entity.entityValue;
  res.status(301).redirect(`${config.REDIRECT_URL}?auth=ok`);
};

export const handleRedirect = async (req: Request, res: Response) => {
  // parse the request
  const q = req.query;
  if (q.error) {
    // An error response e.g. error=access_denied
    res.status(500).send();
    return;
  }
  // Get Auth Code
  if (typeof q.code !== "string") {
    res.status(500).send();
    return;
  }
  try {
    const userToken = await getTokenFromCode(q.code);
    if (!userToken) {
      res.status(500).send();
      return;
    }
    // Query the DB and see if we already have the user
    const entity = await getUserByPK(
      getPKFromSub(userToken.sub),
      getSKFromUserName(userToken.name, userToken.sub, true),
      false
    );
    if (entity) {
      loginUser(req, res, entity);
      return;
    }
    // If it is their first time using twitter clone
    // Register them
    const registeredUser = await registerUser(userToken);
    if (!registeredUser) {
      res.status(301).redirect(`${config.REDIRECT_URL}?auth=no`);
      return;
    }
    loginUser(req, res, registeredUser);
  } catch (e: unknown) {
    res.status(500).send();
  }
};

export const sendAuthorizationUrl = (_req: Request, res: Response) => {
  res.redirect(authorizationUrl);
};

export const handleLogout = (req: Request, res: Response) => {
  req.session.isAuth = false;
  res.status(200).json({ location: "/" });
};
