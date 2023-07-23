import { Router } from "express";
import { prisma } from ".."
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

import { hashPassword } from "../utils";
import { AccountDetails, CompanyDetails } from "./types/signup.type";
import authGuard from "../middlewares/auth";

const signUpRouter = Router();

signUpRouter.post("/account-details", async (req, res) => {
    /**
 * @swagger
 * components:
 *   schemas:
 *     AccountDetails:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - jobTitle
 *       properties:
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         jobTitle:
 *           type: string
 *           description: The job title of the user
 *       example:
 *         firstName: John
 *         lastName: Doe
 *         email: johndoe@gmail.com
 *         password: password
 *         jobTitle: Software Engineer
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the user
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         customerId:
 *           type: string
 *           description: The ID of the associated customer
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           description: The roles assigned to the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         jobTitle:
 *           type: string
 *           description: The job title of the user
 *       example:
 *         id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a"
 *         firstName: John
 *         lastName: Doe
 *         email: johndoe@gmail.com
 *         customerId: "6c84fb90-12c4-11e1-840d-7b25c5ee775a"
 *         roles: ["USER", "AGENT"]
 *         username: johndoe@gmail.com
 *         jobTitle: Software Engineer
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the customer
 *         firstName:
 *           type: string
 *           description: The first name of the customer
 *         lastName:
 *           type: string
 *           description: The last name of the customer
 *         email:
 *           type: string
 *           description: The email of the customer
 *         b2b:
 *           type: boolean
 *           description: Indicates if the customer is a business-to-business customer
 *         info:
 *           type: object
 *           properties:
 *             seats:
 *               type: number
 *               description: The number of seats available to the customer
 *       example:
 *         id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a"
 *         firstName: John
 *         lastName: Doe
 *         email: johndoe@gmail.com
 *         b2b: true
 *         info:
 *           seats: 1
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful or not
 *         message:
 *           type: string
 *           description: The error message
 *       example:
 *         success: false
 *         message: "Account with email already exists"
 *     AccountDetailsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful or not
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *               description: The created user
 *             customer:
 *               $ref: '#/components/schemas/Customer'
 *               description: The created customer
 *       example:
 *         success: true
 *         data:
 *           user:
 *             id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a"
 *             firstName: John
 *             lastName: Doe
 *             email: johndoe@gmail.com
 *             customerId: "6c84fb90-12c4-11e1-840d-7b25c5ee775a"
 *             roles: ["USER", "AGENT"]
 *             username: johndoe@gmail.com
 *             jobTitle: Software Engineer
 *           customer:
 *             id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a"
 *             firstName: John
 *             lastName: Doe
 *             email: johndoe@gmail.com
 *             b2b: true
 *             info:
 *               seats: 1
 */

    /**
     * @swagger
     * /account-details:
     *   post:
     *     summary: Create an account with user details
     *     tags:
     *       - Authentication
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AccountDetails'
     *     responses:
     *       '201':
     *         description: Account created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AccountDetailsResponse'
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

    const { firstName, lastName, email, password, jobTitle }: AccountDetails = req.body;

    try {

        const hashedPassword = await hashPassword(password);
        const accountId = uuidv4();
        const userId = uuidv4();

        const existingAccount = await prisma.userCredentials.findUnique({
            where: {
                email
            }
        });

        if (existingAccount) {
            return res.status(400).json({
                success: false,
                message: "Account with email already exists"
            });
        }

        const customer = await prisma.customer.create({
            data: {
                id: accountId,
                firstName,
                lastName,
                email,
                b2b: true,
                info: {
                    seats: 1,
                }
            }
        });

        const user = await prisma.user.create({
            data: {
                id: userId,
                firstName,
                lastName,
                email,
                customerId: accountId,
                roles: ["USER", "AGENT"],
                username: email,
                jobTitle
            }
        })

        const userCredentials = await prisma.userCredentials.create({
            data: {
                email,
                password: hashedPassword,
                userId
            }
        });

        if (!user || !userCredentials || !customer) {
            return res.status(400).json({
                success: false,
                message: "Unable to create user"
            });
        }

        return res.status(201).json({
            success: true,
            data: {
                user,
                customer
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
})


signUpRouter.post("/company-details/:customerId", async (req, res) => {

    /**
     * @swagger
     * components:
     *   schemas:
     *     CompanyDetails:
     *       type: object
     *       required:
     *         - seats
     *       properties:
     *         seats:
     *           type: number
     *           description: The number of seats available for the company
     *         website:
     *           type: string
     *           description: The website URL of the company
     *         industry:
     *           type: string
     *           description: The industry of the company
     *         country:
     *           type: string
     *           description: The country of the company
     *       example:
     *         seats: 100
     *         website: "https://example.com"
     *         industry: "IT"
     *         country: "USA"
     *     ErrorResponse:
     *       type: object
     *       properties:
     *         success:
     *           type: boolean
     *           description: Indicates if the request was successful or not
     *         message:
     *           type: string
     *           description: The error message
     *       example:
     *         success: false
     *         message: "Company does not exist"
     *     CompanyDetailsResponse:
     *       type: object
     *       properties:
     *         success:
     *           type: boolean
     *           description: Indicates if the request was successful or not
     *         data:
     *           $ref: '#/components/schemas/Customer'
     *           description: The updated company details
     *       example:
     *         success: true
     *         data:
     *           id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a"
     *           firstName: John
     *           lastName: Doe
     *           email: johndoe@gmail.com
     *           b2b: true
     *           info:
     *             seats: 100
     *             website: "https://example.com"
     *             industry: "IT"
     *             country: "USA"
     */

    /**
     * @swagger
     * /company-details/{customerId}:
     *   post:
     *     summary: Update company details for a customer
     *     tags:
     *       - Authentication
     *     parameters:
     *       - name: customerId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *           description: The ID of the customer
     *           example: "6c84fb90-12c4-11e1-840d-7b25c5ee775a"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CompanyDetails'
     *     responses:
     *       '201':
     *         description: Company details updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CompanyDetailsResponse'
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


    const { customerId }: { customerId: string } = req.params;
    const { seats, website, industry, country }: CompanyDetails = req.body;

    try {
        const existingCompany = await prisma.customer.findUnique({
            where: {
                id: customerId
            }
        })

        if (!existingCompany) {
            return res.status(400).json({
                success: false,
                message: "Company does not exist"
            });
        }

        const company = await prisma.customer.update({
            where: {
                id: customerId
            },
            data: {
                info: {
                    seats,
                    website,
                    industry,
                    country,
                }
            }
        });

        if (!company) {
            return res.status(400).json({
                success: false,
                message: "Unable to update company"
            });
        }

        return res.status(201).json({
            success: true,
            data: company
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
})


signUpRouter.put("/password", authGuard, async (req, res) => {
    /**
 * @swagger
 * components:
 *   schemas:
 *     AuthGuard:
 *       type: object
 *       properties:
 *         Authorization:
 *           type: string
 *           description: The Bearer token for authentication
 *       example:
 *         Authorization: "Bearer your_access_token_here"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful or not
 *         message:
 *           type: string
 *           description: The error message
 *       example:
 *         success: false
 *         message: "Account with email does not exist"
 *     PasswordUpdateRequest:
 *       type: object
 *       required:
 *         - email
 *         - oldPassword
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *           description: The email of the user
 *         oldPassword:
 *           type: string
 *           description: The old password of the user
 *         newPassword:
 *           type: string
 *           description: The new password to be set
 *       example:
 *         email: johndoe@example.com
 *         oldPassword: old_password_here
 *         newPassword: new_password_here
 *     PasswordUpdateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful or not
 *         message:
 *           type: string
 *           description: The response message
 *         data:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: The email of the user
 *           description: The updated user credentials
 *       example:
 *         success: true
 *         message: "Password updated successfully"
 *         data:
 *           email: johndoe@example.com
 */

    /**
     * @swagger
     * /password:
     *   put:
     *     summary: Update user password
     *     tags:
     *       - Authentication
     *     security:
     *       - AuthGuard: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PasswordUpdateRequest'
     *     responses:
     *       '201':
     *         description: Password updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PasswordUpdateResponse'
     *       '400':
     *         description: Bad Request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       '401':
     *         description: Unauthorized
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


    const { email, oldPassword, newPassword }: { email: string, oldPassword: string, newPassword: string } = req.body;

    try {
        const existingAccount = await prisma.userCredentials.findUnique({
            where: {
                email
            }
        });

        if (!existingAccount) {
            return res.status(400).json({
                success: false,
                message: "Account with email does not exist"
            });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, existingAccount.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }

        const hashedPassword = await hashPassword(newPassword);

        const updatedAccount = await prisma.userCredentials.update({
            where: {
                email
            },
            data: {
                password: hashedPassword
            }
        });

        if (!updatedAccount) {
            return res.status(400).json({
                success: false,
                message: "Unable to update password"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Password updated successfully",
            data: {
                email: updatedAccount.email
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
});

export default signUpRouter;