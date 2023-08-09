import { Router } from 'express';
import appSetting from './app-setting.route';
import breakSetting from './break-setting.route';
import colorSettings from './colors-setting.route';
import soundsSetting from './sounds-setting.route';

const browserExtention = Router();

browserExtention.use(appSetting)
browserExtention.use(breakSetting)
browserExtention.use(colorSettings)
browserExtention.use(soundsSetting)

export default browserExtention;