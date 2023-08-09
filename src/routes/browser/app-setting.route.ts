import { Router } from 'express';

import { prisma } from '../..';
import { ModifiedRequest } from '../../middlewares/types';
import { AppSettings } from '@prisma/client';
import { getOrCreateInitialSettings } from '../../services/browser-extension/getOrCreateInitialSettings';

const appSettingRoute = Router();

appSettingRoute.put('/app-settings', async (req: ModifiedRequest, res) => {

    const { setting }: { setting: AppSettings } = req.body;
    const userId = req.userId;

    console.log('appSettings', userId);

    try {
        const extensionSettings = await getOrCreateInitialSettings(userId!);

        if (!extensionSettings) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong'
            });
        }

        if (setting) {
            const updatedSettings = await prisma.appSettings.update({
                where: {
                    userId
                },
                data: {
                    activeTime: setting.activeTime!,
                    language: setting.language,
                    theme: setting.theme,
                    paused: setting.paused,
                }
            });
            return res.status(200).json(updatedSettings)
        }

        return res.status(200).json(extensionSettings.app);


    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

});

appSettingRoute.get('/app-settings', async (req: ModifiedRequest, res) => {

    const userId = req.userId;

    try {
        const extensionSettings = await getOrCreateInitialSettings(userId!);

        if (!extensionSettings) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong'
            });
        }

        return res.status(200).json(extensionSettings.app);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

});


export default appSettingRoute;