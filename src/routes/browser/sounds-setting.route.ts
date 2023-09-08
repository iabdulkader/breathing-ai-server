import { Router } from "express";

import { prisma } from "../..";
import { ModifiedRequest } from "../../middlewares/types";
import { getOrCreateInitialSettings } from "../../services/browser-extension/getOrCreateInitialSettings";
import { SoundsSettings } from "../../services/browser-extension/initialSettings";

const soundsSetting = Router();

soundsSetting.put("/sounds-settings", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /browser-extension/sounds-settings:
   *   put:
   *     summary: Update or Retrieve Sound Settings
   *     description: Update or retrieve sound settings for a user.
   *     tags:
   *       - Sound Settings
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       description: Sound settings to be updated (if provided).
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               setting:
   *                 // Define your soundSettings schema here
   *     responses:
   *       200:
   *         description: Sound settings updated or retrieved successfully.
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

  const { setting }: { setting: SoundsSettings } = req.body;
  const userId = req.userId;

  try {
    const extensionSettings = await getOrCreateInitialSettings(userId!);

    if (!extensionSettings) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }

    if (setting) {
      const updatedSettings = await prisma.soundSettings.update({
        where: {
          userId,
        },
        data: setting,
      });
      return res.status(200).json(updatedSettings);
    }

    return res.status(200).json(extensionSettings.sounds);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

soundsSetting.get("/sounds-settings", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /browser-extension/sounds-settings:
   *   get:
   *     summary: Retrieve Sound Settings
   *     description: Retrieve sound settings for a user.
   *     tags:
   *       - Sound Settings
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Sound settings retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               // Define the schema for the retrieved sound settings here.
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

    return res.status(200).json(extensionSettings.sounds);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

export default soundsSetting;
