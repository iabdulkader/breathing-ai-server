import { Router } from "express";

import { prisma } from "../../..";
import { ModifiedRequest } from "../../../middlewares/types";
import { getOrCreateInitialSettings } from "../../../services/browser-extension/getOrCreateInitialSettings";
import { SoundsSettings } from "../../../services/browser-extension/initialSettings";

const screentimeRouter = Router();

export const getCurrentDate = () => {
  return new Date().toISOString().substr(0, 10);
};

screentimeRouter.get("/screentime/today", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /screentime/today:
   *   get:
   *     summary: Retrieve Screen Time for Today
   *     description: Retrieve screen time data for the current day for a user.
   *     tags:
   *       - Screen Time
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Screen time data for today retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 currentDate:
   *                   type: string
   *                   description: The current date for which screen time data is retrieved.
   *                   format: date
   *                 screenTime:
   *                   // Define the schema for the screen time data here.
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
  const currentDate = getCurrentDate();

  try {
    let screenTime = await prisma.userScreenTime.findFirst({
      where: {
        userId: userId,
        date: currentDate,
      },
    });

    if (!screenTime) {
      screenTime = await prisma.userScreenTime.create({
        data: {
          userId: userId!,
          date: currentDate,
          screenTime: {},
        },
      });

      return res.status(200).json({
        [screenTime.date]: screenTime.screenTime,
      });
    }

    return res.status(200).json({
      [screenTime.date]: screenTime.screenTime,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

screentimeRouter.put("/screentime", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /screentime:
   *   put:
   *     summary: Update Screen Time Data
   *     description: Update or create screen time data for a specific date for a user.
   *     tags:
   *       - Screen Time
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       description: Screen time data to be updated or created.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               screenTime:
   *                 type: object
   *                 description: Screen time data for the specified date.
   *                 example:
   *                   "2023-09-08": 120
   *               date:
   *                 type: string
   *                 description: The date for which screen time data is updated or created.
   *                 format: date
   *                 example: "2023-09-08"
   *     responses:
   *       200:
   *         description: Screen time data updated or created successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 [date]:
   *                   type: object
   *                   description: Screen time data for the specified date.
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

  const {
    screenTime,
    date,
  }: {
    screenTime: {
      [key: string]: number;
    };
    date: string;
  } = req.body;

  try {
    const screenTimeData = await prisma.userScreenTime.findFirst({
      where: {
        userId: userId,
        date: date,
      },
    });

    if (!screenTimeData) {
      const newTimeDate = await prisma.userScreenTime.create({
        data: {
          userId: userId!,
          date: date,
          screenTime: screenTime,
        },
      });

      return res.status(200).json({
        [date]: screenTime,
      });
    }

    const updatedScreenTime = await prisma.userScreenTime.update({
      where: {
        id: screenTimeData.id,
      },
      data: {
        screenTime: screenTime,
      },
    });

    return res.status(200).json({
      [date]: updatedScreenTime.screenTime,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

export default screentimeRouter;
