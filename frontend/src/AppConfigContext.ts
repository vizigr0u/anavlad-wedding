import React from 'react';
import { AppConfig } from './types';
import { defaultAppConfig } from './appconfig.default';

export const ConfigContext = React.createContext<AppConfig>(defaultAppConfig);
