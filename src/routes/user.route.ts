import { Router } from 'express';

import { prisma } from '..';
import { ModifiedRequest } from '../middlewares/types';

const userRouter = Router();

userRouter.put('/user/details/name', async (req: ModifiedRequest, res) => {

    /**
     * @swagger
     * components:
     *   securitySchemes:
     *     bearerAuth:
     *       type: http
     *       scheme: bearer
     *       bearerFormat: JWT
     *
     * /user/details/name:
     *   put:
     *     summary: Update user details (first name and last name)
     *     tags: [User]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               firstName:
     *                 type: string
     *               lastName:
     *                 type: string
     *             example:
     *               firstName: John
     *               lastName: Doe
     *     responses:
     *       200:
     *         description: User details updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   default: true
     *                 message:
     *                   type: string
     *                   default: User details updated successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       description: The user's ID
     *                     firstName:
     *                       type: string
     *                       description: The updated first name of the user
     *                     lastName:
     *                       type: string
     *                       description: The updated last name of the user
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   default: false
     *                 message:
     *                   type: string
     *                   default: Something went wrong
     */



    const userId = req.userId;

    const { firstName, lastName }: { firstName: string, lastName: string } = req.body;

    try {
        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                firstName,
                lastName
            }
        });

        res.status(200).json({
            success: true,
            message: 'User details updated successfully',
            data: user
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: (err as Error).message
        });
    }

});


export default userRouter;