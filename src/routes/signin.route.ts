import { Router } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { prisma } from ".."



const signInRouter = Router();

signInRouter.post("/login", async (req, res) => {

    /**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         email: johndoe@gmail.com
 *         password: password
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful or not
 *         message:
 *           type: string
 *           description: The error message
 *     LoginSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the login was successful
 *         data:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: The email of the logged-in user
 *             userId:
 *               type: number
 *               description: The ID of the logged-in user
 *         token:
 *           type: string
 *           description: A JWT token for authentication
 *       example:
 *         success: true
 *         data:
 *           email: johndoe@gmail.com
 *           userId: 1
 *         token: "your_jwt_token_here"
 */

    /**
     * @swagger
     * /login:
     *   post:
     *     summary: Log in a user
     *     tags:
     *       - Authentication
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       '200':
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/LoginSuccessResponse'
     *       '401':
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       '400':
     *         description: Bad Request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       '500':
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */


    const { email, password }: { email: string, password: string } = req.body;

    try {

        const existingAccount = await prisma.userCredentials.findUnique({
            where: {
                email
            }
        });

        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!existingAccount || !existingUser) {
            return res.status(400).json({
                success: false,
                message: "Account with email does not exist"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, existingAccount.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Wrong password"
            });
        }

        const token = jwt.sign({ email, customerId: existingUser.customerId, userId: existingAccount.userId }, process.env.JWT_SECRET!, { expiresIn: "10d" });

        return res.status(200).json({
            success: true,
            data: {
                email,
                userId: existingAccount.userId,
            },
            token
        });


    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });

    }
});


export default signInRouter;