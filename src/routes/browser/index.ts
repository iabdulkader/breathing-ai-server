import { Router } from 'express';
import appSetting from './app-setting.route';
import breakSetting from './break-setting.route';

const browserExtention = Router();

browserExtention.use(appSetting)
browserExtention.use(breakSetting)

export default browserExtention;