import * as http from 'http';
import { LiveEvent } from './model';

const TYPES = ['route', 'request', 'function', 'event', 'stack'];

export function startEventServer(port: number, onEvent: (e: LiveEvent) => void) {
    const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'content-type');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

        if (req.method === 'OPTIONS') {
            res.writeHead(204).end();
            return;
        }
        if (req.method !== 'POST' || req.url !== '/event') {
            res.writeHead(404).end();
            return;
        }

        let body = '';
        req.on('data', (c) => {
            body += c;
            if (body.length > 20000) {
                req.destroy();
            }
        });
        req.on('end', () => {
            try {
                const d = JSON.parse(body);
                if (typeof d.name !== 'string' || !TYPES.includes(d.type)) {
                    res.writeHead(400).end();
                    return;
                }
                onEvent({
                    type: d.type,
                    name: d.name,
                    source: typeof d.source === 'string' ? d.source : 'http',
                    ts: Date.now(),
                    file: typeof d.file === 'string' ? d.file : undefined,
                    line: typeof d.line === 'number' ? d.line : undefined,
                    detail: typeof d.detail === 'string' ? d.detail : undefined
                });
                res.writeHead(204).end();
            } catch {
                res.writeHead(400).end();
            }
        });
    });

    server.on('error', () => { });
    server.listen(port, '127.0.0.1');
    return server;
}