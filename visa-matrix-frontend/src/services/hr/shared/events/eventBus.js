class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventName, listener) {
    const currentListeners = this.listeners.get(eventName) ?? [];
    currentListeners.push(listener);
    this.listeners.set(eventName, currentListeners);
  }

  async emit(eventName, payload) {
    const currentListeners = this.listeners.get(eventName) ?? [];
    for (const listener of currentListeners) {
      await listener(payload);
    }
  }
}

export const hrEventBus = globalThis.__VM_HR_EVENT_BUS__ ?? new EventBus();
globalThis.__VM_HR_EVENT_BUS__ = hrEventBus;

