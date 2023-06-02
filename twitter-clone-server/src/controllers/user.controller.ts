/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import { createFollower } from "../models/FollowerEntity";
import { UserEntity } from "../models/UserEntity";
import {
    getUserByPK,
    updateUser,
    UpdateUserRequestBody,
    queryAllUsers,
    signedProfileImage,
} from "../database/db_user";
import {
    addNewFollowingRelation, populateRelation, removeFollowingRelation,
} from "../database/db_relation";
import { onFollow, onUnFollow } from "../database/db_timeline";
import { getPKFromSub, colors, countries } from "../helpers/util";

interface FollowUserRequestBody {
    followingUserId: string;
}

interface UnfollowUserRequestBody {
    unFollowingUserId: string;
}

export const getUser = async (
     req: Request,
     res: Response,
) => {
    if (!req.session || !req.session.uid) {
        res.status(500).send();
        return;
    };
    // Username-sub
    const { handle } = req.params;
    const split = handle.split("-");
    const pk = getPKFromSub(split[2])  // User-<user name>-sub
    const sk = handle
    const user = await getUserByPK(pk, sk, true);
    if (!user) {
        res.status(500).send();
        return;
    }
    const resUser = await populateRelation(req.session.uid, user);
    res.status(200).json({ ...resUser })
};

/*
For Getting a user, we simply return from our sessionData.
Since we make sure that stale sessionData is flushed upon modification
This is ok
*/
export const getCurUser = async (req: Request, res: Response) => {
    if (!req.session) {
        res.status(500).send();
        return;
    }
    if (!req.session.isAuth || !req.session.uid || !req.session.entityType) {
        res.status(500).send();
        return;
    }
    try {
        const user = await getUserByPK(req.session.uid, req.session.entityType, true);
        if (!user) {
            res.status(500).send();
        } else {
            res.status(200).json({ ...user });
        }
    } catch {
        res.status(500).send();
    }
};

const validateUpdateInput = (intro: string, color: string, country: string) => {
    if (intro.length > 100) {
        return false;
    };
    if (!colors.includes(color)) {
        return false;
    };
    if (!countries.includes(country)) {
        return false
    };
    return true;
};

// 1. Get the request body extract UserName and Email
// 2.
   // - If the user does not exist, respond with error
   // - If it does, update the field accordingly
export const updateCurUser = async (
    req: Request<{}, {}, UpdateUserRequestBody>,
    res: Response,
) => {
    if (!req.session || !req.session.uid || !req.session.entityType) {
        res.status(500).send();
        return;
    }
    const { introduction, favColor, country } = req.body;
    const pk = req.session.uid;
    const sk = req.session.entityType;
    if (!validateUpdateInput(introduction, favColor, country)) {
        res.status(400).send();
        return;
    }
    try {
        const updatedData = await updateUser({
            introduction, favColor, country,
        }, pk, sk)
        if (!updatedData) {
            res.status(500).send();
            return;
        }
        const newUser = await signedProfileImage(updatedData.Attributes as UserEntity)
        res.status(200).json({ ...newUser })
    } catch {
        res.status(500).send();
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    // session, pk, sk not defined
    if (!req.session || !req.session.uid) {
        res.status(500).send();
        return;
    }
    try {
        const usrs = await queryAllUsers(req.session.uid);
        res.status(200).json(usrs);
    } catch {
        res.status(500).send();
    }
};

export const followUser = async (req: Request<{}, {}, FollowUserRequestBody>, res: Response) => {
    if (!req.session || !req.session.uid) {
        res.status(500).send();
        return;
    };
    const { followingUserId } = req.body;
    if (!followingUserId) {
        res.status(400).send();
    };
    const followingEntity = createFollower(req.session.uid, followingUserId);
    const rel = await addNewFollowingRelation(followingEntity);
    if (!rel) {
        res.status(500).send();
        return;
    }
    const suc = await onFollow(req.session.uid, followingUserId);
    if (!suc) {
        res.status(500).send();
    } else {
        res.status(200).send();
    }
};

export const unFollowUser = async (req: Request<{}, {}, UnfollowUserRequestBody>, res: Response) => {
    if (!req.session || !req.session.uid) {
        res.status(500).send();
        return;
    };
    const { unFollowingUserId } = req.body;
    if (!unFollowingUserId) {
        res.status(400).send();
    };
    const suc = await removeFollowingRelation(req.session.uid, unFollowingUserId);
    if (!suc) {
        res.status(500).send();
        return;
    };
    const suc2 = await onUnFollow(req.session.uid, unFollowingUserId);
    if (!suc2) {
        res.status(500).send();
    } else {
        res.status(200).send();
    }
};
