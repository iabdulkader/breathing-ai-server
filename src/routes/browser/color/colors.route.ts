import { Router } from 'express';

import { prisma } from '../../..';
import { ModifiedRequest } from '../../../middlewares/types';
import { v4 as uuidv4 } from 'uuid';

const colorsApi = Router();

export const getCurrentDate = () => {
    return new Date().toISOString().substr(0, 10);
};

export const fallBackColorsArray = [
    '#EBCF6B',
    '#B9AD8C',
    '#F1812E',
    '#E7595B',
    '#90CCE5',
    '#F4BDF0',
];

colorsApi.get('/colors', async (req: ModifiedRequest, res) => {

    const userId = req.userId;

    try {
        let userColors = await prisma.userColors.findFirst({
            where: {
                userId: userId,
            }
        })

        if (!userColors) {
            userColors = await prisma.userColors.create({
                data: {
                    userId: userId!,
                    colors: fallBackColorsArray
                }
            });
            return res.status(200).json({
                colors: userColors.colors
            });
        }

        return res.status(200).json({
            colors: userColors.colors
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

})




export default colorsApi;