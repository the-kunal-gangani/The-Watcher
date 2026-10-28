import { execFile } from 'child_process';
import { EventStore } from '../store';
import { StackAdapter } from '../model';

const RESUMED = /(?:topResumedActivity|mResumedActivity)[^\n]*?\s([\w.]+)\/([\w.$]+)/;

export class AndroidAdapter implements StackAdapter {
    id = 'android';
    private timer?: NodeJS.Timeout;
    private last = '';
    private busy = false;

    constructor(private store: EventStore) { }

    start() {
        this.timer = setInterval(() => this.poll(), 1500);
    }

    private poll() {
        if (this.busy) {
            return;
        }
        this.busy = true;
        execFile(
            'adb',
            ['shell', 'dumpsys', 'activity', 'activities'],
            { timeout: 4000, maxBuffer: 10 * 1024 * 1024 },
            (err, out) => {
                this.busy = false;
                if (err) {
                    return;
                }
                const m = RESUMED.exec(out);
                if (!m) {
                    return;
                }
                const pkg = m[1];
                const cls = m[2].startsWith('.') ? pkg + m[2] : m[2];
                if (cls === this.last) {
                    return;
                }
                this.last = cls;
                this.store.add({
                    type: 'route',
                    name: cls.split('.').pop() ?? cls,
                    source: 'android',
                    ts: Date.now(),
                    detail: cls
                });
            }
        );
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = undefined;
    }
}