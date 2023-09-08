import { Router } from "express";

import { prisma } from "..";
import { ModifiedRequest } from "../middlewares/types";

const bookmarkRoute = Router();

bookmarkRoute.get("/user/bookmarks", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /user/bookmarks:
   *   get:
   *     summary: Get User Bookmarks
   *     description: Retrieve a user's bookmarks based on their user ID.
   *     tags:
   *       - User Bookmarks
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: userId
   *         description: The ID of the user whose bookmarks are to be retrieved.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully retrieved the user's bookmarks.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 bookmarks:
   *                   type: array
   *                   description: An array of content IDs that the user has bookmarked.
   *                   items:
   *                     type: string
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
   *                   description: A message describing the error that occurred.
   */

  const userId = req.userId;

  try {
    const bookmarked = await prisma.bookmarks.findUnique({
      where: {
        userId,
      },
    });

    return res.status(200).json({
      bookmarks: bookmarked?.contentIds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

bookmarkRoute.put("/user/bookmarks", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /user/bookmarks:
   *   put:
   *     summary: Update User Bookmarks
   *     description: Update a user's bookmarks by adding a new content ID.
   *     tags:
   *       - User Bookmarks
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *       - in: body
   *         name: bookmarks
   *         description: An array of content IDs to add to the user's bookmarks.
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             bookmarks:
   *               type: array
   *               description: An array of content IDs to add.
   *               items:
   *                 type: string
   *     responses:
   *       200:
   *         description: Successfully updated the user's bookmarks.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 bookmarks:
   *                   type: array
   *                   description: An empty array to indicate success.
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
   *                   description: A message describing the error that occurred.
   */

  const { bookmarks } = req.body;
  const userId = req.userId;

  const contentId = bookmarks[0];

  try {
    const bookmarked = await prisma.bookmarks.upsert({
      where: {
        userId,
      },
      update: {
        contentIds: {
          push: contentId,
        },
      },
      create: {
        userId: userId as string,
        contentIds: bookmarks as string[],
      },
    });

    return res.status(200).json({
      bookmarks: [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

export default bookmarkRoute;
