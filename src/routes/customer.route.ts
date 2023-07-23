import { Router } from "express";

import { prisma } from "..";
import { ModifiedRequest } from "../middlewares/types";
import { CustomerToAdd, CustomerWithId } from "./types/customer.type";
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