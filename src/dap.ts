import * as vscode from 'vscode';
import { EventStore } from './store';

export function registerTracker(
    ctx: vscode.ExtensionContext,
    store: EventStore,
    onVmUri: (uri: string) => void
) {
    ctx.subscriptions.push(
        vscode.debug.registerDebugAdapterTrackerFactory('*', {
            createDebugAdapterTracker(session: vscode.DebugSession) {
                return {
                    onDidSendMessage: async (m: any) => {
                        if (m.type !== 'event') {
                            return;
                        }
                        if (m.event === 'dart.debuggerUris' && m.body?.vmServiceUri) {
                            onVmUri(m.body.vmServiceUri);
                            return;
                        }
                        if (m.event === 'stopped') {
                            try {
                                const res = await session.customRequest('stackTrace', {
                                    threadId: m.body.threadId,
                                    levels: 15
                                });
                                const frames = res.stackFrames ?? [];
                                const top = frames[0];
                                if (!top) {
                                    return;
                                }
                                store.add({
                                    type: 'stack',
                                    name: top.name,
                                    source: session.type,
                                    ts: Date.now(),
                                    file: top.source?.path,
                                    line: top.line,
                                    detail: frames.map((f: any) => f.name).join(' ← ')
                                });
                            } catch { }
                        }
                    }
                };
            }
        })
    );
}