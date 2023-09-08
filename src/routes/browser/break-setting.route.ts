import { Router } from "express";

import { prisma } from "../..";
import { ModifiedRequest } from "../../middlewares/types";
import { BreakSettings } from "@prisma/client";
import { getOrCreateInitialSettings } from "../../services/browser-extension/getOrCreateInitialSettings";

const breakSetting = Router();

breakSetting.put("/breaks-settings", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /browser-extension/breaks-settings:
   *   put:
   *     summary: Update or Retrieve Break Settings
   *     description: Update or retrieve break settings for a user.
   *     tags:
   *       - Break Settings
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       description: Break settings to be updated (if provided).
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               setting:
   *                 // Define your breakSettings schema here
   *     responses:
   *       200:
   *         description: Break settings updated or retrieved successfully.
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

  const { setting }: { setting: BreakSettings } = req.body;
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
      const updatedSettings = await prisma.breakSettings.update({
        where: {
          userId,
        },
        data: setting,
      });
      return res.status(200).json(updatedSettings);
    }

    return res.status(200).json(extensionSettings.breaks);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

breakSetting.get("/breaks-settings", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /browser-extension/breaks-settings:
   *   get:
   *     summary: Retrieve Break Settings
   *     description: Retrieve break settings for a user.
   *     tags:
   *       - Break Settings
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Break settings retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               // Define the schema for the retrieved break settings here.
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

    return res.status(200).json(extensionSettings.breaks);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

export default breakSetting;
