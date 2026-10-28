import * as vscode from 'vscode';
import { EventStore } from './store';
import { LiveEvent } from './model';

const ICONS: Record<string, string> = {
    route: 'location',
    request: 'globe',
    function: 'symbol-method',
    event: 'zap',
    stack: 'debug-stackframe'
};

export class EventTree implements vscode.TreeDataProvider<LiveEvent> {
    private emitter = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this.emitter.event;

    constructor(private store: EventStore) {
        store.onChange(() => this.emitter.fire());
    }

    getTreeItem(e: LiveEvent): vscode.TreeItem {
        const item = new vscode.TreeItem(e.name);
        item.description = `${e.source} · ${new Date(e.ts).toLocaleTimeString()}`;
        item.tooltip = e.detail ?? e.name;
        item.iconPath = new vscode.ThemeIcon(ICONS[e.type] ?? 'circle-outline');
        if (e.file) {
            item.command = {
                command: 'livetrace.open',
                title: 'Open',
                arguments: [e.file, e.line ?? 1]
            };
        }
        return item;
    }

    getChildren() {
        return this.store.all();
    }
}

export function createStatusBar(store: EventStore) {
    const bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    bar.tooltip = 'LiveTrace: current page';
    const render = () => {
        const r = store.currentRoute();
        bar.text = r ? `$(location) ${r.name}` : '$(location) LiveTrace';
        bar.show();
    };
    store.onChange(render);
    render();
    return bar;
}