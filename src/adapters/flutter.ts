import WebSocket from 'ws';
import { EventStore } from '../store';
import { StackAdapter } from '../model';

export class FlutterAdapter implements StackAdapter {
    id = 'flutter';
    private ws?: WebSocket;

    constructor(private store: EventStore) { }

    connect(vmServiceUri: string) {
        this.stop();
        const base = vmServiceUri.replace(/^http/, 'ws').replace(/\/$/, '');
        const url = base.endsWith('/ws') ? base : base + '/ws';
        const ws = new WebSocket(url);
        this.ws = ws;

        ws.on('open', () => {
            ws.send(
                JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'streamListen',
                    params: { streamId: 'Extension' }
                })
            );
        });
        ws.on('message', (raw) => this.handle(raw.toString()));
        ws.on('error', () => { });
    }

    private handle(raw: string) {
        let msg: any;
        try {
            msg = JSON.parse(raw);
        } catch {
            return;
        }
        if (msg.method !== 'streamNotify') {
            return;
        }
        const ev = msg.params?.event;
        if (ev?.kind !== 'Extension') {
            return;
        }

        const kind: string = ev.extensionKind ?? '';
        const data = ev.extensionData ?? {};

        if (kind === 'Flutter.Navigation') {
            const route = data.route;
            const name = route?.settings?.name ?? route?.description ?? 'unnamed route';
            this.store.add({ type: 'route', name, source: 'flutter', ts: Date.now() });
            return;
        }
        if (!kind.startsWith('Flutter.') && kind) {
            this.store.add({
                type: 'event',
                name: kind,
                source: 'flutter',
                ts: Date.now(),
                detail: JSON.stringify(data)
            });
        }
    }

    start() { }

    stop() {
        this.ws?.close();
        this.ws = undefined;
    }
}