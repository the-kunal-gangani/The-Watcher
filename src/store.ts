import * as vscode from 'vscode';
import { LiveEvent } from './model';

export class EventStore {
    private events: LiveEvent[] = [];
    private emitter = new vscode.EventEmitter<void>();
    readonly onChange = this.emitter.event;

    add(e: LiveEvent) {
        this.events.unshift(e);
        if (this.events.length > 200) {
            this.events.length = 200;
        }
        this.emitter.fire();
    }

    all() {
        return this.events;
    }

    currentRoute() {
        return this.events.find((e) => e.type === 'route');
    }

    clear() {
        this.events = [];
        this.emitter.fire();
    }
}