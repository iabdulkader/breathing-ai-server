import { Router } from 'express';

import { prisma } from '../..';
import { ModifiedRequest } from '../../middlewares/types';
import { v4 as uuidv4 } from 'uuid';

const analyticsRouter = Router();

export const getCurrentDate = () => {
    return new Date().toISOString().substr(0, 10);
};

analyticsRouter.get('/browser-extension/analytics', async (req: ModifiedRequest, res) => {

    const userId = req.userId;

    try {
        const userImprovements = await prisma.userImprovement.findFirst({
            where: {
                userId: userId,
            },
            include: {
                improvement: true
            }
        })


        return res.status(200).json({
            totalBreaks: userImprovements?.improvement.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

})




export default analyticsRouter;