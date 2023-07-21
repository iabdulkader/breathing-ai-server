import { Router } from "express";
import { prisma } from ".."
import { hashPassword } from "../utils";
import { v4 as uuidv4 } from 'uuid';

const signUpRouter = Router();

signUpRouter.post("/account-details", async (req, res) => {
    const { firstName, lastName, email, password, jobTitle } = req.body;

    try {

        const hashedPassword = await hashPassword(password);
        const accountId = uuidv4();
        const userId = uuidv4();

        const existingAccount = await prisma.userCredentials.findUnique({
            where: {
                email
            }
        });

        if(existingAccount) {
            return res.status(400).json({ 
                success: false,
                error: "Account with email already exists" 
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

        if(!user || !userCredentials || !customer) {
            return res.status(400).json({ 
                success: false,
                error: "Unable to create user" 
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
            error: "Something went wrong" 
        });
    }
})


signUpRouter.post("/company-details/:customerId", async (req, res) => {
    const { customerId } = req.params;
    const { seats, website, industry, country } = req.body;

    try {
        const existingCompany = await prisma.customer.findUnique({
            where: {
                id: customerId
            }
        })

        if(!existingCompany) {
            return res.status(400).json({ 
                success: false,
                error: "Company does not exist" 
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

        if(!company) {
            return res.status(400).json({ 
                success: false,
                error: "Unable to update company" 
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
            error: "Something went wrong" 
        });
    }
})

export default signUpRouter;