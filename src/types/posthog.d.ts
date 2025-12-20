interface PostHog {
  capture(event: string, properties?: Record<string, any>): void;
  identify(distinctId?: string, properties?: Record<string, any>): void;
  reset(): void;
  isFeatureEnabled(key: string): boolean;
  getFeatureFlag(key: string): boolean | string | undefined;
  onFeatureFlags(callback: (flags: string[], variants: Record<string, string | boolean>) => void): void;
}

interface Window {
  posthog?: PostHog;
}

declare const posthog: PostHog | undefined;
