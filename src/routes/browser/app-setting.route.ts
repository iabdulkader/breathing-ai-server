import { Router } from "express";

import { prisma } from "../..";
import { ModifiedRequest } from "../../middlewares/types";
import { AppSettings } from "@prisma/client";
import { getOrCreateInitialSettings } from "../../services/browser-extension/getOrCreateInitialSettings";

const appSetting = Router();

appSetting.put("/app-settings", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /browser-extension/app-settings:
   *   put:
   *     summary: Update or Retrieve App Settings
   *     description: Update or retrieve app settings for a user.
   *     tags:
   *       - App Settings
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       description: App settings to be updated (if provided).
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               setting:
   *                 // Define your appSettings schema here
   *     responses:
   *       200:
   *         description: App settings updated or retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               // Define the schema for the response here (updated settings or retrieved settings).
   *       500:
   *         description: Internal Server Error. An error occurred while processing the request.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   description: Indicates whether the request was successful (false in this case).
   *                 message:
   *                   type: string
   *                   description: An error message describing the error that occurred.
   */

  const { setting }: { setting: AppSettings } = req.body;
  const userId = req.userId;

  console.log("appSettings", userId);

  try {
    const extensionSettings = await getOrCreateInitialSettings(userId!);

    if (!extensionSettings) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }

    if (setting) {
      const updatedSettings = await prisma.appSettings.update({
        where: {
          userId,
        },
        data: {
          activeTime: setting.activeTime!,
          language: setting.language,
          theme: setting.theme,
          paused: setting.paused,
        },
      });
      return res.status(200).json(updatedSettings);
    }

    return res.status(200).json(extensionSettings.app);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

appSetting.get("/app-settings", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /browser-extension/app-settings:
   *   get:
   *     summary: Retrieve App Settings
   *     description: Retrieve app settings for a user.
   *     tags:
   *       - App Settings
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: App settings retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               // Define the schema for the retrieved app settings here.
   *       500:
   *         description: Internal Server Error. An error occurred while processing the request.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   description: Indicates whether the request was successful (false in this case).
   *                 message:
   *                   type: string
   *                   description: An error message describing the error that occurred.
   */

  const userId = req.userId;

  try {
    const extensionSettings = await getOrCreateInitialSettings(userId!);

    if (!extensionSettings) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }

    return res.status(200).json(extensionSettings.app);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

export default appSetting;
