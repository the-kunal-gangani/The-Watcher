export type EventType = 'route' | 'request' | 'function' | 'event' | 'stack';

export interface LiveEvent {
    type: EventType;
    name: string;
    source: string;
    ts: number;
    file?: string;
    line?: number;
    detail?: string;
}

export interface StackAdapter {
    id: string;
    start(): void;
    stop(): void;
}