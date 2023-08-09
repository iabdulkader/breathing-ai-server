import { Router } from 'express';

import { prisma } from '../..';
import { ModifiedRequest } from '../../middlewares/types';
import { getOrCreateInitialSettings } from '../../services/browser-extension/getOrCreateInitialSettings';
import { SoundsSettings } from '../../services/browser-extension/initialSettings';

const soundsSetting = Router();

soundsSetting.put('/sounds-settings', async (req: ModifiedRequest, res) => {

    const { setting }: { setting: SoundsSettings } = req.body;
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
            const updatedSettings = await prisma.soundSettings.update({
                where: {
                    userId
                },
                data: setting
            });
            return res.status(200).json(updatedSettings)
        }

        return res.status(200).json(extensionSettings.sounds);


    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

});

soundsSetting.get('/sounds-settings', async (req: ModifiedRequest, res) => {

    const userId = req.userId;

    try {
        const extensionSettings = await getOrCreateInitialSettings(userId!);

        if (!extensionSettings) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong'
            });
        }

        return res.status(200).json(extensionSettings.sounds);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }

});


export default soundsSetting;