import * as vscode from 'vscode';
import { EventStore } from './store';
import { startEventServer } from './eventServer';
import { registerTracker } from './dap';
import { FlutterAdapter } from './adapters/flutter';
import { AndroidAdapter } from './adapters/android';
import { EventTree, createStatusBar } from './ui';

export async function activate(ctx: vscode.ExtensionContext) {
    const store = new EventStore();
    const flutter = new FlutterAdapter(store);
    const android = new AndroidAdapter(store);

    const server = startEventServer(7788, (e) => store.add(e));
    ctx.subscriptions.push({ dispose: () => server.close() });

    registerTracker(ctx, store, (uri) => flutter.connect(uri));

    ctx.subscriptions.push(
        vscode.debug.onDidTerminateDebugSession(() => flutter.stop()),
        createStatusBar(store),
        vscode.window.registerTreeDataProvider('livetrace.events', new EventTree(store)),
        vscode.commands.registerCommand('livetrace.clear', () => store.clear()),
        vscode.commands.registerCommand('livetrace.open', async (file: string, line: number) => {
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(file));
            const pos = new vscode.Position(Math.max(line - 1, 0), 0);
            await vscode.window.showTextDocument(doc, { selection: new vscode.Range(pos, pos) });
        }),
        { dispose: () => android.stop() }
    );

    const pubspec = await vscode.workspace.findFiles('pubspec.yaml', null, 1);
    if (pubspec.length === 0) {
        const gradle = await vscode.workspace.findFiles(
            '{settings.gradle,settings.gradle.kts,build.gradle,build.gradle.kts}',
            '**/node_modules/**',
            1
        );
        if (gradle.length > 0) {
            android.start();
        }
    }
}

export function deactivate() { }