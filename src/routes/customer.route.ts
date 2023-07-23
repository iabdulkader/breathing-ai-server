import { Router } from "express";

import { prisma } from "..";
import { ModifiedRequest } from "../middlewares/types";
import { CustomerToAdd } from "./types/customer.type";
import customerService from "../services/customerService";

const customerRouter = Router();

customerRouter.post("/customer/add-user", async (req: ModifiedRequest, res) => {
    const parentCustomerId = req.userId;

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
            await customerService.addUserToCustomer(user, parentCustomerId)
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

export default customerRouter;