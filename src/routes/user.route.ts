import { Router } from 'express';

import { prisma } from '..';
import { ModifiedRequest } from '../middlewares/types';

const userRouter = Router();

userRouter.put('/account-details', async (req: ModifiedRequest, res) => {

    /**
     * @swagger
     * components:
     *   securitySchemes:
     *     BearerAuth:
     *       type: http
     *       scheme: bearer
     *       bearerFormat: JWT
     *
     * /user/details/name:
     *   put:
     *     summary: Update user details (first name and last name)
     *     tags: [User]
     *     security:
     *       - BearerAuth: []
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
    const customerId = req.customerId;

    const { firstName, lastName, companyName, phone, language }:
        {
            firstName: string,
            lastName: string,
            companyName: string,
            phone: string,
            language: string
        } = req.body;

    try {
        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                firstName,
                lastName,

            }
        });

        const existingCustomer = await prisma.customer.findUnique({
            where: {
                id: customerId
            }
        });

        const customer = await prisma.customer.update({
            where: {
                id: customerId
            },
            data: {
                firstName,
                lastName,
                companyName,
                language,
                info: {
                    ...existingCustomer?.info as any,
                    phone
                }
            }
        });


        res.status(200).json({
            success: true,
            message: 'User details updated successfully',
            data: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                companyName: customer.companyName,
                // @ts-ignore
                phone: customer?.info?.phone,
                language: customer.language
            }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: (err as Error).message
        });
    }

});

userRouter.get("/me", async (req: ModifiedRequest, res) => {
    /**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current user's profile
 *     description: Retrieve the profile of the currently authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation. Returns user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A message describing the result of the operation.
 *                   example: User found
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: A message describing the error.
 *                   example: User not found
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: A message describing the error.
 *                   example: Internal Server Error
 *     securitySchemes:
 *       BearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */


    const userId = req.userId;

    try {

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User found',
            data: user
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: (err as Error).message
        });
    }
});


export default userRouter;