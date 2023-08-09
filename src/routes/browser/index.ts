import { Router } from 'express';
import appSettingRoute from './app-setting.route';

const browserExtention = Router();

browserExtention.use(appSettingRoute)

export default browserExtention;