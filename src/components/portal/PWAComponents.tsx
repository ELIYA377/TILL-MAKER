import React, { useEffect, useState, useCallback } from 'react';
import { Download, ExternalLink, Smartphone, WifiOff, X } from 'lucide-react';
import { usePortalCopy } from '../../lib/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'ds_pwa_prompt_dismissed_at';

// Capture early beforeinstallprompt events even before React mounts
let capturedInstallPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(ev: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    capturedInstallPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((cb) => cb(capturedInstallPrompt));
  });
  window.addEventListener('appinstalled', () => {
    capturedInstallPrompt = null;
    promptListeners.forEach((cb) => cb(null));
  });
}

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < 12 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    capturedInstallPrompt
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    const checkStandalone = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsInstalled(checkStandalone());

    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const onPromptChange = (ev: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(ev);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      capturedInstallPrompt = null;
    };

    promptListeners.add(onPromptChange);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      promptListeners.delete(onPromptChange);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    const promptEvent = deferredPrompt || capturedInstallPrompt;
    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        capturedInstallPrompt = null;
        return true;
      }
    } catch {
      /* ignore if browser rejected prompt */
    }
    return false;
  }, [deferredPrompt]);

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    isInIframe,
    install,
  };
}

export const PWAInstallButton: React.FC<{ variant?: 'dark' | 'light'; compact?: boolean }> = ({
  variant = 'dark',
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const { copy } = usePortalCopy();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2 text-xs'
        } ${
          variant === 'dark'
            ? 'bg-[#162B52] hover:bg-[#1E3A6E] text-[#D4AF37] border border-[#D4AF37]/40'
            : 'bg-[#0B162C] hover:bg-[#132547] text-white'
        }`}
      >
        {isIOS ? (
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <Download className="w-3.5 h-3.5 shrink-0" />
        )}
        <span>{isIOS ? copy.installIosBtn : copy.installApp}</span>
      </button>

      {showGuide && (
        <InstallGuideModal
          isIOS={isIOS}
          isInIframe={isInIframe}
          onClose={() => setShowGuide(false)}
        />
      )}
    </>
  );
};

const InstallGuideModal: React.FC<{
  isIOS: boolean;
  isInIframe: boolean;
  onClose: () => void;
}> = ({ isIOS, isInIframe, onClose }) => {
  const { copy } = usePortalCopy();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '/';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-white border border-slate-200 p-6 shadow-xl text-slate-900">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-[#0B162C]">
            {isIOS ? copy.iosGuideTitle : copy.browserGuideTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isInIframe && (
          <div className="mb-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <p>{copy.browserGuideIframeNote}</p>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B162C] text-white font-semibold hover:bg-[#132547]"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{copy.openFullTabBtn}</span>
            </a>
          </div>
        )}

        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          {isIOS ? (
            <>
              <p>{copy.iosGuideStep1}</p>
              <p>{copy.iosGuideStep2}</p>
            </>
          ) : (
            <>
              <p>{copy.browserGuideStep1}</p>
              <p>{copy.browserGuideStep2}</p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-[#0B162C] py-2.5 text-xs font-semibold text-white hover:bg-[#132547] cursor-pointer"
        >
          {copy.close}
        </button>
      </div>
    </div>
  );
};

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const { copy } = usePortalCopy();
  const [dismissed, setDismissed] = useState(() => wasRecentlyDismissed());
  const [showGuide, setShowGuide] = useState(false);

  // Automatic first-gesture install attempt when Chromium/Android makes beforeinstallprompt ready
  useEffect(() => {
    if (!isInstallable || isInstalled || dismissed) return;

    let triggered = false;
    const handleFirstInteraction = (ev: MouseEvent) => {
      if (triggered) return;
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      // Never hijack form submissions, buttons, links, inputs, or dismiss buttons
      if (target.closest('form, button, a, input, textarea, select, option, label, [data-pwa-dismiss="true"]')) {
        return;
      }
      triggered = true;
      window.removeEventListener('click', handleFirstInteraction, { capture: true });
      install();
    };

    window.addEventListener('click', handleFirstInteraction, { capture: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction, { capture: true });
    };
  }, [isInstallable, isInstalled, dismissed, install]);

  if (isInstalled || dismissed || (!isInstallable && !isIOS && !isInIframe)) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <div className="fixed bottom-16 lg:bottom-5 right-4 left-4 sm:left-auto sm:max-w-sm z-40 bg-[#0B162C] text-white border border-[#D4AF37]/50 rounded-xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <img
            src="/pwa-192x192.png"
            alt="Digital Sales Pro Max App"
            className="w-10 h-10 rounded-lg border border-[#D4AF37]/40 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#D4AF37]">{copy.installAppTitle}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              {isInIframe && !isInstallable ? copy.browserGuideIframeNote : copy.installAppDesc}
            </p>
            <div className="flex items-center gap-2 mt-3">
              {isInIframe && !isInstallable ? (
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B162C] text-[11px] font-bold cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{copy.installNowBtn}</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    if (isInstallable) {
                      const ok = await install();
                      if (ok) return;
                    }
                    setShowGuide(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B162C] text-[11px] font-bold cursor-pointer"
                >
                  {isInstallable ? copy.installNowBtn : copy.installIosBtn}
                </button>
              )}
              <button
                type="button"
                data-pwa-dismiss="true"
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                {copy.laterBtn}
              </button>
            </div>
          </div>
          <button
            type="button"
            data-pwa-dismiss="true"
            onClick={handleDismiss}
            aria-label={copy.close}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showGuide && (
        <InstallGuideModal
          isIOS={isIOS}
          isInIframe={isInIframe}
          onClose={() => setShowGuide(false)}
        />
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const { copy } = usePortalCopy();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>{copy.offlineNotice}</span>
    </div>
  );
};
