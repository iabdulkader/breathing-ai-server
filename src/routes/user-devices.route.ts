import { Router } from "express";

import { prisma } from "..";
import { ModifiedRequest } from "../middlewares/types";
import { UserDevices } from "@prisma/client";

const userDevicesRouter = Router();

userDevicesRouter.post("/user-devices", async (req: ModifiedRequest, res) => {
  /**
   * @swagger
   * /user-devices:
   *   post:
   *     summary: Create User Devices
   *     description: Create user devices associated with a user.
   *     tags:
   *       - User Devices
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         description: Bearer token for user authentication.
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       description: User device details to be created.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               // Define your userDevices schema here
   *     responses:
   *       200:
   *         description: User devices created successfully.
   *         content:
   *           application/json:
   *             schema:
   *               // Define the schema for the response here
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

  const userDevices: Omit<UserDevices, "id"> = req.body;

  try {
    const userDevicesRes = await prisma.userDevices.create({
      data: {
        ...userDevices,
        userId: req.userId!,
      },
    });

    return res.status(200).json(userDevicesRes);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

export default userDevicesRouter;
