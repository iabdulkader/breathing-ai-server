import { Router } from "express";

import { prisma } from "../..";
import { ModifiedRequest } from "../../middlewares/types";
import { v4 as uuidv4 } from "uuid";

const analyticsRouter = Router();

export const getCurrentDate = () => {
  return new Date().toISOString().substr(0, 10);
};

analyticsRouter.get(
  "/browser-extension/analytics",
  async (req: ModifiedRequest, res) => {
    /**
     * @swagger
     * /browser-extension/analytics:
     *   get:
     *     summary: Retrieve Browser Extension Analytics
     *     description: Retrieve analytics for a browser extension user.
     *     tags:
     *       - Browser Extension
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         description: Bearer token for user authentication.
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Browser extension analytics retrieved successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 totalBreaks:
     *                   type: integer
     *                   description: The total number of breaks recorded for the user.
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
      const userImprovements = await prisma.userImprovement.findFirst({
        where: {
          userId: userId,
        },
        include: {
          improvement: true,
        },
      });

      return res.status(200).json({
        totalBreaks: userImprovements?.improvement.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
);

export default analyticsRouter;
