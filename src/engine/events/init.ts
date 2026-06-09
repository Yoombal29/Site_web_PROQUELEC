import { CommandRegistry, CommandBus, registerBuilderCommands } from '@/engine/commands';
import { eventBus } from './bus';

// ── Global instances ─────────────────────────────────────────

export const commandRegistry = new CommandRegistry();
export const commandBus = new CommandBus(commandRegistry);

// ── Initialize ───────────────────────────────────────────────

export function initializeBuilderEngine(): void {
  // Register all builder command handlers
  registerBuilderCommands(commandRegistry);

  // Dev logging middleware — only in dev mode
  if (import.meta.env?.DEV) {
    eventBus.use((eventName, payload, next) => {
      console.debug(`[EventBus] ${eventName}`, payload);
      next();
    });
  }

  // Expose for debugging
  if (typeof window !== 'undefined' && import.meta.env?.DEV) {
    (window as Record<string, unknown>).__commandBus = commandBus;
    (window as Record<string, unknown>).__commandRegistry = commandRegistry;
  }
}
