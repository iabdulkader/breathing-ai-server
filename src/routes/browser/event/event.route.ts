import { Router } from 'express';

import { prisma } from '../../..';
import { ModifiedRequest } from '../../../middlewares/types';
import { v4 as uuidv4 } from 'uuid';

const eventRouter = Router();

export const getCurrentDate = () => {
    return new Date().toISOString().substr(0, 10);
};

eventRouter.post('/browser-extension/event/break', async (req: ModifiedRequest, res) => {

    const userId = req.userId;
    console.log("asjd", req.body);
    const event: {
        contentUrl: string;
        completed: boolean;
        rating: number;
        lang: string;
    } = req.body;


    try {
        let userImprovements = await prisma.userImprovement.findFirst({
            where: {
                userId: userId,
            }
        })

        if (!userImprovements) {
            userImprovements = await prisma.userImprovement.create({
                data: {
                    userId: userId!,

                }
            });
        }
        const contentId = uuidv4();

        const newImprovement = await prisma.improvement.create({
            data: {
                userImprovementId: userImprovements.id,
                contentIds: [contentId],
                completed: event.completed,
                device: 'browser_extension',
                rating: event.rating,
            }
        });

        return res.status(200).json({
            contentId: contentId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

})


export default eventRouter;