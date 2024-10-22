import mitt from 'mitt';

const eventBus = mitt();

export function once<T>(event: string, handler: (data: T) => void): void {
    const onceHandler = (data: unknown) => {
        handler(data as T);
        eventBus.off(event, onceHandler); // 移除事件监听
    };
    eventBus.on(event, onceHandler);
}

export default {
    once,
    ...eventBus
};