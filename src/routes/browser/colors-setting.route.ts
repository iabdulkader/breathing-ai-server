import { Router } from "express";

import { prisma } from "../..";
import { ModifiedRequest } from "../../middlewares/types";
import { ColorsSetting } from "@prisma/client";
import { getOrCreateInitialSettings } from "../../services/browser-extension/getOrCreateInitialSettings";

const colorSettings = Router();

colorSettings.put("/colors-settings", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /browser-extension/colors-settings:
   *   put:
   *     summary: Update or Retrieve Color Settings
   *     description: Update or retrieve color settings for a user.
   *     tags:
   *       - Color Settings
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       description: Color settings to be updated (if provided).
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               setting:
   *                 // Define your colorSettings schema here
   *     responses:
   *       200:
   *         description: Color settings updated or retrieved successfully.
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

  const { setting }: { setting: ColorsSetting } = req.body;
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
      const updatedSettings = await prisma.colorsSetting.update({
        where: {
          userId,
        },
        data: setting,
      });
      return res.status(200).json(updatedSettings);
    }

    return res.status(200).json(extensionSettings.colors);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

colorSettings.get("/colors-settings", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /browser-extension/colors-settings:
   *   get:
   *     summary: Retrieve Color Settings
   *     description: Retrieve color settings for a user.
   *     tags:
   *       - Color Settings
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Color settings retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               // Define the schema for the retrieved color settings here.
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

    return res.status(200).json(extensionSettings.colors);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

export default colorSettings;
