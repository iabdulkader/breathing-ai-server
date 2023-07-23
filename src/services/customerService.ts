import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

import { CustomerToAdd } from "../routes/types/customer.type";
import { prisma } from "..";

interface CustomerServiceType {
    addUserToCustomer: (customer: CustomerToAdd, parentUserId: string) => Promise<void>
}


const customerService: CustomerServiceType = {
    addUserToCustomer: async (customer: CustomerToAdd, parentUserId: string) => {
        const userId = uuidv4();

        try {
            await prisma.user.create({
                data: {
                    id: userId,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    customerId: parentUserId,
                    username: customer.email,
                    roles: ["USER"],
                    info: {
                        department: customer.department
                    }
                }
            });

            const hashedPassword = await bcrypt.hash(userId, 10);

            await prisma.userCredentials.create({
                data: {
                    email: customer.email,
                    password: hashedPassword,
                    userId
                }
            });
        } catch (error) {
            console.log(error);
            throw new Error("Something went wrong");
        }
    }
};



export default customerService;