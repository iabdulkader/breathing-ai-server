import { Router } from 'express';

import { prisma } from '../..';
import { ModifiedRequest } from '../../middlewares/types';
import { ColorsSetting } from '@prisma/client';
import { getOrCreateInitialSettings } from '../../services/browser-extension/getOrCreateInitialSettings';

const appSetting = Router();

appSetting.put('/colors-settings', async (req: ModifiedRequest, res) => {

    const { setting }: { setting: ColorsSetting } = req.body;
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
            const updatedSettings = await prisma.colorsSetting.update({
                where: {
                    userId
                },
                data: setting
            });
            return res.status(200).json(updatedSettings)
        }

        return res.status(200).json(extensionSettings.colors);


    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

});

appSetting.get('/colors-settings', async (req: ModifiedRequest, res) => {

    const userId = req.userId;

    try {
        const extensionSettings = await getOrCreateInitialSettings(userId!);

        if (!extensionSettings) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong'
            });
        }

        return res.status(200).json(extensionSettings.colors);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

});


export default appSetting;