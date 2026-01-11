// 定义事件映射接口
interface EventMap {
  error: [{ type: string; message: any }];
  create: [];
  destroy: [];
  start: [Event];
  stop: [Event];
  reset: [];
  pause: [Event];
  resume: [Event];
  dataavailable: [BlobEvent];
  [key: string]: any[];
}

// 导出事件类型
export type EventType = keyof EventMap;

// 泛型事件发射器类
export default class L3EventEmitter<
  TEvents extends Record<string, any[]> = EventMap,
> {
  private events: {
    [K in keyof TEvents]?: Array<(...args: TEvents[K]) => void>;
  } = {};

  /**
   * 注册事件监听器
   * @param name 事件名称
   * @param callback 事件回调函数
   */
  on<K extends keyof TEvents>(
    name: K,
    callback: (...args: TEvents[K]) => void,
  ) {
    const eventHandlers = this.events[name] || [];
    eventHandlers.push(callback);
    this.events[name] = eventHandlers;
  }

  /**
   * 触发事件
   * @param name 事件名称
   * @param args 事件参数
   */
  emit<K extends keyof TEvents>(name: K, ...args: TEvents[K]): void {
    const handlers = this.events[name];
    if (handlers?.length) {
      handlers.forEach((handler) => {
        try {
          handler.apply(this, args);
        } catch (error) {
          console.error(`emit ${String(name)} error`, error);
        }
      });
    } else {
      console.error(`emit ${String(name)} is not found`);
    }
  }

  /**
   * 移除事件监听器
   * @param name 事件名称
   * @param callback 要移除的回调函数
   */
  off<K extends keyof TEvents>(
    name: K,
    callback: (...args: TEvents[K]) => void,
  ): void {
    const handlers = this.events[name];
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    } else {
      console.error(`off ${String(name)} is not found`);
    }
  }

  /**
   * 注册一次性事件监听器
   * @param name 事件名称
   * @param callback 事件回调函数（只会执行一次）
   */
  once<K extends keyof TEvents>(
    name: K,
    callback: (...args: TEvents[K]) => void,
  ): void {
    // 创建一个包装函数
    const wrapper = (...args: TEvents[K]) => {
      // 调用原始回调
      callback.apply(this, args);
      // 自动移除监听器
      this.off(name, wrapper);
    };

    // 注册包装函数
    this.on(name, wrapper);
  }

  /**
   * 清空事件监听器
   * @param name 可选的事件名称，如果提供则清空指定事件，否则清空所有事件
   */
  clear<K extends keyof TEvents>(name?: K) {
    if (name) {
      this.events[name] = [];
    } else {
      this.events = {};
    }
  }

  /**
   * 获取指定事件的监听器数量
   * @param name 事件名称
   * @returns 监听器数量
   */
  listenerCount<K extends keyof TEvents>(name: K): number {
    return this.events[name]?.length || 0;
  }
}
