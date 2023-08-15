import { Router } from 'express';

import { prisma } from '..';
import { ModifiedRequest } from '../middlewares/types';
import { UserDevices } from '@prisma/client';

const userDevicesRouter = Router();

userDevicesRouter.post("/user-devices", async (req: ModifiedRequest, res) => {
    const userDevices: Omit<UserDevices, "id"> = req.body;

    try {

        const userDevicesRes = await prisma.userDevices.create({
            data: {
                ...userDevices,
                userId: req.userId!,
            },

        });

        return res.status(200).json(userDevicesRes)
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
});




export default userDevicesRouter