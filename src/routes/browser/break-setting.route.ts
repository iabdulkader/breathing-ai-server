import { Router } from 'express';

import { prisma } from '../..';
import { ModifiedRequest } from '../../middlewares/types';
import { BreakSettings } from '@prisma/client';
import { getOrCreateInitialSettings } from '../../services/browser-extension/getOrCreateInitialSettings';

const breakSetting = Router();

breakSetting.put('/breaks-settings', async (req: ModifiedRequest, res) => {

    const { setting }: { setting: BreakSettings } = req.body;
    const userId = req.userId;


    try {
        const extensionSettings = await getOrCreateInitialSettings(userId!);

        if (!extensionSettings) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong'
            });
        }

        if (setting) {
            const updatedSettings = await prisma.breakSettings.update({
                where: {
                    userId
                },
                data: setting
            });
            return res.status(200).json(updatedSettings)
        }

        return res.status(200).json(extensionSettings.breaks);


    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

});

breakSetting.get('/breaks-settings', async (req: ModifiedRequest, res) => {

    const userId = req.userId;

    try {
        const extensionSettings = await getOrCreateInitialSettings(userId!);

        if (!extensionSettings) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong'
            });
        }

        return res.status(200).json(extensionSettings.breaks);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

});


export default breakSetting;