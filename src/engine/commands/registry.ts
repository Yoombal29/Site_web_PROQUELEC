import type { Command, CommandHandler, CommandResult, CommandBusState } from './types';

export class CommandRegistry {
  private handlers = new Map<string, CommandHandler>();

  register(handler: CommandHandler): void {
    if (this.handlers.has(handler.type)) {
      console.warn(`[CommandRegistry] Overriding handler for type "${handler.type}"`);
    }
    this.handlers.set(handler.type, handler);
  }

  unregister(type: string): void {
    this.handlers.delete(type);
  }

  getHandler(type: string): CommandHandler | undefined {
    return this.handlers.get(type);
  }

  hasHandler(type: string): boolean {
    return this.handlers.has(type);
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export class CommandBus {
  private registry: CommandRegistry;
  private state: CommandBusState = {
    history: [],
    historyIndex: -1,
    maxHistory: 50,
  };

  constructor(registry: CommandRegistry) {
    this.registry = registry;
  }

  execute(command: Command): CommandResult {
    const handler = this.registry.getHandler(command.type);
    if (!handler) {
      const error = `No handler registered for command type "${command.type}"`;
      console.error(`[CommandBus] ${error}`);
      return { success: false, command, error };
    }

    try {
      handler.execute(command);

      if (!command.silent) {
        // Truncate future history on new command
        this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
        this.state.history.push(command);
        if (this.state.history.length > this.state.maxHistory) {
          this.state.history.shift();
        }
        this.state.historyIndex = this.state.history.length - 1;
      }

      return { success: true, command };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[CommandBus] Error executing "${command.type}":`, err);
      return { success: false, command, error: message };
    }
  }

  undo(): CommandResult | null {
    if (this.state.historyIndex < 0) return null;

    const command = this.state.history[this.state.historyIndex];
    const handler = this.registry.getHandler(command.type);

    if (handler?.undo) {
      try {
        handler.undo(command);
        this.state.historyIndex--;
        return { success: true, command };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[CommandBus] Error undoing "${command.type}":`, err);
        return { success: false, command, error: message };
      }
    }

    // No undo handler — just move index back (consumer must restore snapshot)
    this.state.historyIndex--;
    return { success: true, command };
  }

  redo(): CommandResult | null {
    if (this.state.historyIndex >= this.state.history.length - 1) return null;

    const command = this.state.history[this.state.historyIndex + 1];
    const handler = this.registry.getHandler(command.type);

    if (handler) {
      try {
        handler.execute(command);
        this.state.historyIndex++;
        return { success: true, command };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[CommandBus] Error redoing "${command.type}":`, err);
        return { success: false, command, error: message };
      }
    }

    this.state.historyIndex++;
    return { success: true, command };
  }

  canUndo(): boolean {
    return this.state.historyIndex >= 0;
  }

  canRedo(): boolean {
    return this.state.historyIndex < this.state.history.length - 1;
  }

  getHistory(): Command[] {
    return [...this.state.history];
  }

  getHistoryIndex(): number {
    return this.state.historyIndex;
  }

  clearHistory(): void {
    this.state.history = [];
    this.state.historyIndex = -1;
  }

  setMaxHistory(max: number): void {
    this.state.maxHistory = max;
  }

  getState(): Readonly<CommandBusState> {
    return this.state;
  }
}
