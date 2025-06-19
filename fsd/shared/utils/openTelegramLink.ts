import { openLink, utils } from '@telegram-apps/sdk';

/**
 * Opens a link using Telegram Mini App API with instant view if available
 * Falls back to regular browser if Telegram API is not available
 */
export const openTelegramLink = (url: string) => {
  try {
    // Check if we're in Telegram environment
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      // Try using openLink from SDK
      if (openLink.isAvailable()) {
        openLink(url, {
          tryInstantView: true,
        });
      } else if (utils && utils.openLink) {
        // Fallback to utils.openLink
        utils.openLink(url, { tryInstantView: true });
      } else {
        // Fallback to WebApp.openLink
        const webApp = (window as any).Telegram.WebApp;
        if (webApp.openLink) {
          webApp.openLink(url);
        } else {
          // Final fallback
          window.open(url, '_blank');
        }
      }
    } else {
      // Not in Telegram environment, use regular browser
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error('Error opening link:', error);
    // Fallback to regular browser
    window.open(url, '_blank');
  }
};