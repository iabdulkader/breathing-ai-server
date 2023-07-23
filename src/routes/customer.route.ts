import { Router } from "express";

import { prisma } from "..";
import { ModifiedRequest } from "../middlewares/types";
import { CustomerToAdd, CustomerWithId } from "./types/customer.type";
import customerService from "../services/customerService";

const customerRouter = Router();

customerRouter.get("/customer/users", async (req: ModifiedRequest, res) => {

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
 *         message: "Something went wrong"
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
 *       example:
 *         id: "a1b2c3d4e5f6"
 *         firstName: John
 *         lastName: Doe
 *         email: johndoe@example.com
 *     GetUsersResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful or not
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *           description: The array of users associated with the customer
 *       example:
 *         success: true
 *         data:
 *           - id: "a1b2c3d4e5f6"
 *             firstName: John
 *             lastName: Doe
 *             email: johndoe@example.com
 *           - id: "x1y2z3w4v5u6"
 *             firstName: Jane
 *             lastName: Smith
 *             email: janesmith@example.com
 */

    /**
     * @swagger
     * /customer/users:
     *   get:
     *     summary: Get users associated with a customer
     *     tags:
     *       - Customer
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       '200':
     *         description: Users retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/GetUsersResponse'
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



    const customerId = req.customerId;

    try {

        const users = await prisma.user.findMany({
            where: {
                customerId
            }
        });

        return res.status(200).json({
            success: true,
            data: users
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
});

customerRouter.post("/customer/add-user", async (req: ModifiedRequest, res) => {

    /**
     * @swagger
     * components:
     *   securitySchemes:
     *     BearerAuth:
     *       type: http
     *       scheme: bearer
     *       bearerFormat: JWT
     *   schemas:
     *     ModifiedRequest:
     *       type: object
     *       properties:
     *         userId:
     *           type: string
     *           description: The ID of the parent customer
     *       example:
     *         userId: "6c84fb90-12c4-11e1-840d-7b25c5ee775a"
     *     CustomerToAdd:
     *       type: object
     *       required:
     *         - email
     *         - firstName
     *         - lastName
     *       properties:
     *         email:
     *           type: string
     *           description: The email of the user to add
     *         firstName:
     *           type: string
     *           description: The first name of the user to add
     *         lastName:
     *           type: string
     *           description: The last name of the user to add
     *       example:
     *         email: johndoe@example.com
     *         firstName: John
     *         lastName: Doe
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
     *         message: "No users to add"
     *     AddUserResponse:
     *       type: object
     *       properties:
     *         success:
     *           type: boolean
     *           description: Indicates if the request was successful or not
     *         message:
     *           type: string
     *           description: The response message
     *         data:
     *           type: array
     *           items:
     *             $ref: '#/components/schemas/CustomerToAdd'
     *           description: The details of the new users added
     *         existingAccounts:
     *           type: array
     *           items:
     *             type: string
     *           description: The emails of existing accounts that were not added
     *       example:
     *         success: true
     *         message: "Users added successfully"
     *         data:
     *           - email: johndoe@example.com
     *             firstName: John
     *             lastName: Doe
     *         existingAccounts:
     *           - johndoe2@example.com
     *           - janedoe@example.com
     */

    /**
     * @swagger
     * /customer/add-user:
     *   post:
     *     summary: Add users to a customer
     *     tags:
     *       - Customer
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - users
     *             properties:
     *               users:
     *                 type: array
     *                 items:
     *                   $ref: '#/components/schemas/CustomerToAdd'
     *                 description: An array of users to add
     *             example:
     *               users:
     *                 - email: johndoe@example.com
     *                   firstName: John
     *                   lastName: Doe
     *                 - email: janedoe@example.com
     *                   firstName: Jane
     *                   lastName: Doe
     *     responses:
     *       '200':
     *         description: Users added successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AddUserResponse'
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


    const parentCustomerId = req.customerId;

    if (!parentCustomerId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const users: CustomerToAdd[] = req.body.users;

    if (!users || users.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No users to add"
        });
    }

    try {
        const allEmails: string[] = users.map((user) => user.email);

        let existingEmails: string[] = [];

        const existingAccounts = await prisma.user.findMany({
            where: {
                email: {
                    in: allEmails
                }
            }
        });

        if (existingAccounts.length > 0) {
            existingEmails = existingAccounts.map((account) => account.email);
        }

        const newUsers = users.filter((user) => !existingEmails.includes(user.email));



        newUsers.map(async (user) => {
            const faild = await customerService.addUserToCustomer(user, parentCustomerId);

            if (faild) {
                existingEmails.push(faild);
            }
        });


        return res.status(200).json({
            success: true,
            message: "Users added successfully",
            data: newUsers,
            existingAccounts: existingEmails
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
});

customerRouter.put("/customer/update-user", async (req: ModifiedRequest, res) => {
    /**
 * @swagger
 * components:
 *   schemas:
 *     ModifiedRequest:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the parent customer
 *       example:
 *         userId: "6c84fb90-12c4-11e1-840d-7b25c5ee775a"
 *     CustomerWithId:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the user to update
 *         email:
 *           type: string
 *           description: The email of the user to update
 *         firstName:
 *           type: string
 *           description: The first name of the user to update
 *         lastName:
 *           type: string
 *           description: The last name of the user to update
 *       example:
 *         id: "a1b2c3d4e5f6"
 *         email: johndoe@example.com
 *         firstName: John
 *         lastName: Doe
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
 *         message: "No users provided"
 *     UpdateUserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful or not
 *         message:
 *           type: string
 *           description: The response message
 *         failedIds:
 *           type: array
 *           items:
 *             type: string
 *           description: The IDs of users that failed to update
 *       example:
 *         success: true
 *         message: "Users updated successfully"
 *         failedIds: ["user_id_1", "user_id_2"]
 */

    /**
     * @swagger
     * /customer/update-user:
     *   put:
     *     summary: Update users for a customer
     *     tags:
     *       - Customer
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - ids
     *               - users
     *             properties:
     *               ids:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: An array of user IDs to update
     *               users:
     *                 type: array
     *                 items:
     *                   $ref: '#/components/schemas/CustomerWithId'
     *                 description: An array of users to update
     *             example:
     *               ids: ["a1b2c3d4e5f6", "x1y2z3"]
     *               users:
     *                 - id: "a1b2c3d4e5f6"
     *                   email: johndoe@example.com
     *                   firstName: John
     *                   lastName: Doe
     *                 - id: "x1y2z3"
     *                   email: janedoe@example.com
     *                   firstName: Jane
     *                   lastName: Doe
     *     responses:
     *       '200':
     *         description: Users updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UpdateUserResponse'
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


    const { users }: { ids: string[], users: CustomerWithId[] } = req.body;

    let failedIds: string[] = [];


    if (!users || users.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No users provided"
        });
    }


    try {
        users.map(async (user) => {
            const failed = await customerService.editUserFromCustomer(user);

            if (failed) {
                failedIds.push(failed);
            }
        });


        return res.status(200).json({
            success: true,
            message: "Users updated successfully",
            failedIds
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }


});

customerRouter.post("/customer/delete", async (req: ModifiedRequest, res) => {
    /**
 * @swagger
 * components:
 *   schemas:
 *     ModifiedRequest:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the parent customer
 *       example:
 *         userId: "6c84fb90-12c4-11e1-840d-7b25c5ee775a"
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
 *         message: "No customer id provided"
 *     DeleteCustomerResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful or not
 *         message:
 *           type: string
 *           description: The response message
 *         failedIds:
 *           type: array
 *           items:
 *             type: string
 *           description: The IDs of customers that failed to delete
 *       example:
 *         success: true
 *         message: "Customer deleted successfully"
 *         failedIds: ["customer_id_1", "customer_id_2"]
 */

    /**
     * @swagger
     * /customer/delete:
     *   post:
     *     summary: Delete customers
     *     tags:
     *       - Customer
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - customerIds
     *             properties:
     *               customerIds:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: An array of customer IDs to delete
     *             example:
     *               customerIds: ["customer_id_1", "customer_id_2"]
     *     responses:
     *       '200':
     *         description: Customers deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/DeleteCustomerResponse'
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


    const { customerIds }: { customerIds: string[] } = req.body;

    let failedIds: string[] = [];

    if (!customerIds) {
        return res.status(400).json({
            success: false,
            message: "No customer id provided"
        });
    }

    try {
        customerIds.map(async (customerId) => {
            const failed = await customerService.deleteUserFromCustomer(customerId);

            if (failed) {
                failedIds.push(failed);
            }
        });

        return res.status(200).json({
            success: true,
            message: "Customer deleted successfully",
            failedIds
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
});

export default customerRouter;