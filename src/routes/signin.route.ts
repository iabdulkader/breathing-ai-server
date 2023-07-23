import { Router } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { prisma } from ".."



const signInRouter = Router();

signInRouter.post("/login", async (req, res) => {
    const { email, password }: { email: string, password: string } = req.body;

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

        const isPasswordValid = await bcrypt.compare(password, existingAccount.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Wrong password"
            });
        }

        const token = jwt.sign({ email, customerId: existingAccount.userId }, process.env.JWT_SECRET!, { expiresIn: "10d" });

        return res.status(200).json({
            success: true,
            data: existingAccount,
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