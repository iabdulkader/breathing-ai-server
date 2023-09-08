import { Router } from "express";

import { prisma } from "../../..";
import { ModifiedRequest } from "../../../middlewares/types";
import { v4 as uuidv4 } from "uuid";

const eventRouter = Router();

export const getCurrentDate = () => {
  return new Date().toISOString().substr(0, 10);
};

eventRouter.post(
  "/browser-extension/event/break",
  async (req: ModifiedRequest, res) => {
    /**
     * @swagger
     * /browser-extension/event/break:
     *   post:
     *     summary: Record Break Event (Browser Extension)
     *     description: Record a break event from a browser extension for a user.
     *     tags:
     *       - Browser Extension Events
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         description: Bearer token for user authentication.
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       description: Break event data to be recorded.
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               contentUrl:
     *                 type: string
     *                 description: The URL of the content associated with the break.
     *               completed:
     *                 type: boolean
     *                 description: Indicates whether the break was completed (true or false).
     *               rating:
     *                 type: number
     *                 description: The user's rating for the break event (numeric value).
     *               lang:
     *                 type: string
     *                 description: The language used for the break event.
     *                 example: "en"
     *     responses:
     *       200:
     *         description: Break event recorded successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 contentId:
     *                   type: string
     *                   description: The unique identifier for the recorded break event.
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
    const event: {
      contentUrl: string;
      completed: boolean;
      rating: number;
      lang: string;
    } = req.body;

    try {
      let userImprovements = await prisma.userImprovement.findFirst({
        where: {
          userId: userId,
        },
      });

      if (!userImprovements) {
        userImprovements = await prisma.userImprovement.create({
          data: {
            userId: userId!,
          },
        });
      }
      const contentId = uuidv4();

      const newImprovement = await prisma.improvement.create({
        data: {
          userImprovementId: userImprovements.id,
          contentIds: [contentId],
          completed: event.completed,
          device: "browser_extension",
          rating: event.rating,
        },
      });

      return res.status(200).json({
        contentId: contentId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
);

export default eventRouter;
