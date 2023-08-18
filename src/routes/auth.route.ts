import { Router } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { prisma } from "..";
import { AccountDetails } from "./types/signup.type";
import { hashPassword } from "../utils";
import { v4 as uuidv4 } from 'uuid';


const authRouter = Router();

authRouter.get('/thirdparty/:provider', (req, res) => {

    try {
        return res.status(200).json({
            redirectUrl: `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=${'http://localhost:4000/auth/thirdparty/google/callback'}&scope=email%20profile&client_id=${process.env.GOOGLE_CLIENT_ID!}`
        })

    } catch (error) {
        console.log(error)
    }
});



authRouter.get('/thirdparty/google/callback', async (req, res) => {
    const authorizationCode = req.query.code;

    try {
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
            params: {
                code: authorizationCode,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: 'http://localhost:4000/auth/thirdparty/google/callback',
                grant_type: 'authorization_code'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const accessToken = tokenResponse.data.access_token;

        const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const userProfile = profileResponse.data;


        const existingUser = await prisma.user.findUnique({
            where: {
                email: userProfile.email
            }
        });
        console.log(existingUser);


        if (existingUser) {
            const token = jwt.sign({
                email: userProfile.email,
                customerId: existingUser.customerId,
                userId: existingUser.id
            }, process.env.JWT_SECRET!, { expiresIn: "10d" })

            res.cookie('session', token)


            return res.redirect(`http://localhost:3000/success`);


        } else {

            const {
                email,
                name,
            } = userProfile as AccountDetails;


            const userId = uuidv4();

            const customerId = uuidv4();

            const userData = await prisma.user.create({
                data: {
                    id: userId,
                    firstName: name!.split(' ')[0],
                    lastName: name!.split(' ')[1] ?? "",
                    email,
                    username: email,
                    roles: ["user"],
                    customerId,
                }
            });

            const customer = await prisma.customer.create({
                data: {
                    id: customerId,
                    firstName: name!.split(' ')[0],
                    lastName: name!.split(' ')[1] && "",
                    b2b: false,
                    email,
                }
            });


            const token = jwt.sign({ email, customerId: customer.id, userId: userData.id }, process.env.JWT_SECRET!, { expiresIn: "10d" });

            res.cookie('session', token)

            return res.redirect(`http://localhost:3000/success`);
        }


    } catch (error) {
        console.log(error)
    }
});



export default authRouter;