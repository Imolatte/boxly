import { useEffect, useRef } from 'react';

export function useTelegramBackButton(show: boolean, onClick?: () => void): void {
  const backButton = window.Telegram?.WebApp?.BackButton;
  const callbackRef = useRef<(() => void) | undefined>(onClick);
  callbackRef.current = onClick;

  useEffect(() => {
    if (!backButton) return;

    const handler = (): void => {
      callbackRef.current?.();
    };

    if (show) {
      backButton.show();
      backButton.onClick(handler);
    } else {
      backButton.hide();
    }

    return () => {
      backButton.offClick(handler);
      backButton.hide();
    };
  }, [show, backButton]);
}
