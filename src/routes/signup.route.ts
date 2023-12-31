import { Router } from "express";
import { prisma } from "..";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

import { hashPassword } from "../utils";
import { AccountDetails, CompanyDetails } from "./types/signup.type";
import authGuard from "../middlewares/auth";
import { ModifiedRequest } from "../middlewares/types";

const signUpRouter = Router();

signUpRouter.post("/signup", async (req, res) => {
  /**
   * @swagger
   * /signup:
   *   post:
   *     summary: User Sign-up
   *     description: Create a new user account.
   *     tags:
   *       - User
   *     requestBody:
   *       description: User sign-up details.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 description: The email address of the user.
   *               firstName:
   *                 type: string
   *                 description: The first name of the user.
   *               lastName:
   *                 type: string
   *                 description: The last name of the user.
   *               password:
   *                 type: string
   *                 description: The user's password.
   *     responses:
   *       200:
   *         description: User created successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: number
   *                   description: The HTTP status code (200).
   *                 message:
   *                   type: string
   *                   description: A message confirming the successful user creation.
   *                 customer:
   *                   type: object
   *                   description: Details of the created customer.
   *                   properties:
   *                     createdOn:
   *                       type: string
   *                       description: Timestamp indicating when the customer was created.
   *                     modifiedOn:
   *                       type: string
   *                       description: Timestamp indicating when the customer was last modified.
   *                     id:
   *                       type: string
   *                       description: The ID of the customer.
   *                     firstName:
   *                       type: string
   *                       description: The first name of the customer.
   *                     lastName:
   *                       type: string
   *                       description: The last name of the customer.
   *                     b2b:
   *                       type: boolean
   *                       description: Indicates whether the customer is a business customer (false in this case).
   *                 user:
   *                   type: object
   *                   description: Details of the created user.
   *                   properties:
   *                     createdOn:
   *                       type: string
   *                       description: Timestamp indicating when the user was created.
   *                     modifiedOn:
   *                       type: string
   *                       description: Timestamp indicating when the user was last modified.
   *                     id:
   *                       type: string
   *                       description: The ID of the user.
   *                     firstName:
   *                       type: string
   *                       description: The first name of the user.
   *                     lastName:
   *                       type: string
   *                       description: The last name of the user.
   *                     email:
   *                       type: string
   *                       description: The email address of the user.
   *                     username:
   *                       type: string
   *                       description: The username (same as email) of the user.
   *                     roles:
   *                       type: array
   *                       description: An array of user roles (["user"] in this case).
   *                     customerId:
   *                       type: string
   *                       description: The ID of the customer associated with the user.
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

  const { email, firstName, lastName, password } = req.body as AccountDetails;

  try {
    const hashedPassword = await hashPassword(password);

    const userId = uuidv4();

    const customerId = uuidv4();

    const userData = await prisma.user.create({
      data: {
        id: userId,
        firstName,
        lastName,
        email,
        username: email,
        roles: ["user"],
        customerId,
      },
    });

    await prisma.userCredentials.create({
      data: {
        email,
        password: hashedPassword,
        userId,
      },
    });

    const customer = await prisma.customer.create({
      data: {
        id: customerId,
        firstName,
        lastName,
        b2b: false,
        email,
      },
    });

    return res.status(200).json({
      status: 200,
      message: "User created successfully",
      customer: {
        createdOn: customer.createdOn,
        modifiedOn: customer.modifiedOn,
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        b2b: customer.b2b,
      },
      user: {
        createdOn: userData.createdOn,
        modifiedOn: userData.modifiedOn,
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username,
        roles: userData.roles,
        customerId: userData.customerId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

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

  const { firstName, lastName, email, password, jobTitle }: AccountDetails =
    req.body;

  try {
    const hashedPassword = await hashPassword(password);
    const accountId = uuidv4();
    const userId = uuidv4();

    const existingAccount = await prisma.userCredentials.findUnique({
      where: {
        email,
      },
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "Account with email already exists",
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
        },
      },
    });

    const user = await prisma.user.create({
      data: {
        id: userId,
        firstName,
        lastName,
        email,
        customerId: accountId,
        roles: ["user", "agent"],
        username: email,
        jobTitle,
      },
    });

    const userCredentials = await prisma.userCredentials.create({
      data: {
        email,
        password: hashedPassword,
        userId,
      },
    });

    if (!user || !userCredentials || !customer) {
      return res.status(400).json({
        success: false,
        message: "Unable to create user",
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        user,
        customer,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

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
   *         comaanyName:
   *           type: string
   *           description: The name of the company
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
   *         comaanyName: "Example Company"
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
   *             comaanyName: "Example Company"
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
  const { seats, website, industry, country, comaanyName }: CompanyDetails =
    req.body;

  try {
    const existingCompany = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company does not exist",
      });
    }

    const company = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        info: {
          comaanyName,
          seats,
          website,
          industry,
          country,
        },
      },
    });

    if (!company) {
      return res.status(400).json({
        success: false,
        message: "Unable to update company",
      });
    }

    return res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

signUpRouter.put("/password", authGuard, async (req: ModifiedRequest, res) => {
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
   *       - BearerAuth: []
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

  const {
    oldPassword,
    newPassword,
  }: { email: string; oldPassword: string; newPassword: string } = req.body;

  const userId = req.userId;

  try {
    const existingAccount = await prisma.userCredentials.findUnique({
      where: {
        userId,
      },
    });

    if (!existingAccount) {
      return res.status(400).json({
        success: false,
        message: "Account with email does not exist",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      existingAccount.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedAccount = await prisma.userCredentials.update({
      where: {
        userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    if (!updatedAccount) {
      return res.status(400).json({
        success: false,
        message: "Unable to update password",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Password updated successfully",
      data: {
        email: updatedAccount.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export default signUpRouter;
