import { Router } from 'express';

import { prisma } from '../..';
import { ModifiedRequest } from '../../middlewares/types';

const breakSettingRoute = Router();

export default breakSettingRoute;