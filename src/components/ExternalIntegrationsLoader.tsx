import { useEffect } from 'react';
import { useExternalIntegrations } from '@/hooks/useDynamicSystems';

declare global {
  interface Window {
    gtag?: any;
    dataLayer?: any[];
    fbq?: any;
    _paq?: any;
    Intercom?: any;
    $crisp?: any;
  }
}

export function ExternalIntegrationsLoader() {
  const { data: integrations } = useExternalIntegrations();

  useEffect(() => {
    if (!integrations) return;

    integrations.forEach(integration => {
      loadIntegration(integration);
    });
  }, [integrations]);

  return null;
}

function loadIntegration(integration: any) {
  const { type, provider, config } = integration;

  switch (type) {
    case 'analytics':
      loadAnalyticsIntegration(provider, config);
      break;
    case 'crm':
      loadCRMIntegration(provider, config);
      break;
    case 'social':
      loadSocialIntegration(provider, config);
      break;
    case 'payment':
      loadPaymentIntegration(provider, config);
      break;
    default:
      console.warn(`Type d'intégration non supporté: ${type}`);
  }
}

function loadAnalyticsIntegration(provider: string, config: any) {
  switch (provider) {
    case 'google-analytics':
      if (!window.gtag) {
        // Google Analytics 4
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer!.push(args);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', config.measurementId);
      }
      break;

    case 'matomo':
      if (!window._paq) {
        window._paq = window._paq || [];
        window._paq.push(['trackPageView']);
        window._paq.push(['enableLinkTracking']);

        const script = document.createElement('script');
        script.async = true;
        script.src = config.trackerUrl || 'https://analytics.proquelec.fr/matomo.js';
        document.head.appendChild(script);
      }
      break;

    case 'plausible':
      if (!document.querySelector('script[data-domain]')) {
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.setAttribute('data-domain', config.domain);
        script.src = config.scriptUrl || 'https://plausible.io/js/plausible.js';
        document.head.appendChild(script);
      }
      break;
  }
}

function loadCRMIntegration(provider: string, config: any) {
  switch (provider) {
    case 'intercom':
      if (!window.Intercom) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://widget.intercom.io/widget/${config.appId}`;
        document.head.appendChild(script);

        window.Intercom = function(...args: any[]) {
          window.Intercom.q = window.Intercom.q || [];
          window.Intercom.q.push(args);
        };
        window.Intercom('boot', { app_id: config.appId });
      }
      break;

    case 'crisp':
      if (!window.$crisp) {
        window.$crisp = [];
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://client.crisp.chat/l.js';
        document.head.appendChild(script);

        window.$crisp.push(['set', 'website-id', config.websiteId]);
      }
      break;

    case 'zendesk':
      if (!document.querySelector('#ze-snippet')) {
        const script = document.createElement('script');
        script.id = 'ze-snippet';
        script.async = true;
        script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.key}`;
        document.head.appendChild(script);
      }
      break;
  }
}

function loadSocialIntegration(provider: string, config: any) {
  switch (provider) {
    case 'facebook-pixel':
      if (!window.fbq) {
        const script = document.createElement('script');
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${config.pixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);
      }
      break;

    case 'twitter-pixel':
      if (!document.querySelector('#twitter-pixel')) {
        const script = document.createElement('script');
        script.id = 'twitter-pixel';
        script.innerHTML = `
          !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
          },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
          a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
          twq('config','${config.pixelId}');
        `;
        document.head.appendChild(script);
      }
      break;
  }
}

function loadPaymentIntegration(provider: string, config: any) {
  switch (provider) {
    case 'stripe':
      if (!document.querySelector('#stripe-js')) {
        const script = document.createElement('script');
        script.id = 'stripe-js';
        script.async = true;
        script.src = 'https://js.stripe.com/v3/';
        document.head.appendChild(script);
      }
      break;

    case 'paypal':
      if (!document.querySelector('#paypal-js')) {
        const script = document.createElement('script');
        script.id = 'paypal-js';
        script.async = true;
        script.src = `https://www.paypal.com/sdk/js?client-id=${config.clientId}&currency=${config.currency || 'EUR'}`;
        document.head.appendChild(script);
      }
      break;
  }
}

// Hook pour utiliser une intégration spécifique
export function useIntegration(type: string, provider?: string) {
  const { data: integrations } = useExternalIntegrations(type);

  if (provider) {
    return integrations?.find(i => i.provider === provider);
  }

  return integrations?.[0];
}

// Fonction utilitaire pour tracker des événements
export function trackEvent(event: string, properties?: Record<string, any>) {
  const analyticsIntegrations = useExternalIntegrations('analytics');

  analyticsIntegrations?.data?.forEach(integration => {
    switch (integration.provider) {
      case 'google-analytics':
        if (window.gtag) {
          window.gtag('event', event, properties);
        }
        break;
      case 'matomo':
        if (window._paq) {
          window._paq.push(['trackEvent', properties?.category || 'General', event, properties?.name, properties?.value]);
        }
        break;
    }
  });
}