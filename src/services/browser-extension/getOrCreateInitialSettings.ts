import { initialAppSettingsState, initialBreaksSettingsState, initialColorsSettingsState, initialSoundSettingsState } from "./initialSettings";
import { prisma } from "../..";

export async function getOrCreateInitialSettings(userId: string) {
    try {
        const extensionSettings = await prisma.extensionSettings.findUnique({
            where: {
                userId,
            },
            include: {
                app: true,
                breaks: true,
                colors: true,
                sounds: true
            }
        });


        if (!extensionSettings) {
            await prisma.extensionSettings.create({
                data: {
                    userId,
                    app: {
                        create: initialAppSettingsState
                    },
                    breaks: {
                        create: initialBreaksSettingsState
                    },
                    colors: {
                        create: initialColorsSettingsState
                    },
                    sounds: {
                        create: initialSoundSettingsState
                    }
                }
            });

            return await prisma.extensionSettings.findUnique({
                where: {
                    userId,
                },
                include: {
                    app: true,
                    breaks: true,
                    colors: true,
                    sounds: true
                }
            });
        }

        return extensionSettings;

    } catch (err) {
        console.log(err);
        return null;
    }
}