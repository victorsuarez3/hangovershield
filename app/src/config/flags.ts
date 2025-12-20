/**
 * Global dev flags
 * Toggle via EXPO_PUBLIC_SHOW_DEV_TOOLS (set to 'true' to enable dev UI/logs in dev builds).
 */

export const SHOW_DEV_TOOLS = __DEV__ && process.env.EXPO_PUBLIC_SHOW_DEV_TOOLS === 'true';

