import { Router } from 'express';

import { prisma } from '../../..';
import { ModifiedRequest } from '../../../middlewares/types';
import { getOrCreateInitialSettings } from '../../../services/browser-extension/getOrCreateInitialSettings';
import { SoundsSettings } from '../../../services/browser-extension/initialSettings';

const screentimeRouter = Router();

export const getCurrentDate = () => {
    return new Date().toISOString().substr(0, 10);
};

screentimeRouter.get('/screentime/today', async (req: ModifiedRequest, res) => {

    const userId = req.userId;
    const currentDate = getCurrentDate();

    try {
        let screenTime = await prisma.userScreenTime.findFirst({
            where: {
                userId: userId,
                date: currentDate
            }
        });


        if (!screenTime) {
            screenTime = await prisma.userScreenTime.create({
                data: {
                    userId: userId!,
                    date: currentDate,
                    screenTime: {}
                }
            });

            return res.status(200).json({
                [screenTime.date]: screenTime.screenTime
            });
        }

        return res.status(200).json({
            [screenTime.date]: screenTime.screenTime
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

})

screentimeRouter.put('/screentime', async (req: ModifiedRequest, res) => {
    const userId = req.userId;

    const { screenTime, date }: {
        screenTime: {
            [key: string]: number
        }, date: string
    } = req.body;

    try {
        const screenTimeData = await prisma.userScreenTime.findFirst({
            where: {
                userId: userId,
                date: date
            }
        });

        if (!screenTimeData) {
            const newTimeDate = await prisma.userScreenTime.create({
                data: {
                    userId: userId!,
                    date: date,
                    screenTime: screenTime
                }
            });

            return res.status(200).json({
                [date]: screenTime
            });
        }

        const updatedScreenTime = await prisma.userScreenTime.update({
            where: {
                id: screenTimeData.id
            },
            data: {
                screenTime: screenTime
            }
        });

        return res.status(200).json({
            [date]: updatedScreenTime.screenTime
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

});



export default screentimeRouter;