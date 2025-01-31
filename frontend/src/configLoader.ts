import { defaultAppConfig } from "./appconfig.default";
import { AppConfig } from "./types";

export async function loadConfig(): Promise<AppConfig> {
    try {
        const response = await fetch('/user-data/appconfig.json');
        const loadedConfig = await response.json();
        // console.log('Loaded config:', response);
        return { ...defaultAppConfig, ...loadedConfig };
    } catch (error) {
        console.error('Could not load config:', error, ' Falling back to default config.');
        return defaultAppConfig;
    }
}
