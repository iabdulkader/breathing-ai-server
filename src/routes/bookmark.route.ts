import { Router } from 'express';

import { prisma } from '..';
import { ModifiedRequest } from '../middlewares/types';

const bookmarkRoute = Router();

bookmarkRoute.get('/user/bookmarks', async (req: ModifiedRequest, res) => {
    const userId = req.userId;

    try {
        const bookmarked = await prisma.bookmarks.findUnique({
            where: {
                userId
            }
        });

        return res.status(200).json({
            bookmarks: bookmarked?.contentIds
        });

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
});

bookmarkRoute.post('/user/bookmarks', async (req: ModifiedRequest, res) => {
    const { bookmarks } = req.body;
    const userId = req.userId;

    const contentId = bookmarks[0]

    try {
        const bookmarked = await prisma.bookmarks.upsert({
            where: {
                userId
            },
            update: {
                contentIds: {
                    push: contentId
                }
            },
            create: {
                userId: userId as string,
                contentIds: bookmarks as string[]
            }
        });

        return res.status(200).json({
            bookmarks: []
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
});


export default bookmarkRoute;