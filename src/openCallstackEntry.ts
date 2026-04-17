import * as vscode from "vscode";
import { FileIndexService } from "./fileIndexService";
import { buildKey } from "./fileIndexService";

export async function openCallstackEntry(
    entry: any,
    index: FileIndexService
) {
    const key = buildKey(entry.type, entry.objectId);
    const location = index.get(key);

    if (!location) {
        vscode.window.showErrorMessage(`Objekt ${entry.objectId} nicht gefunden`);
        return;
    }

    // -------------------------
    // 📄 Lokale Datei
    // -------------------------
    if (location.type === "local") {
        
        const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
            'vscode.executeDocumentSymbolProvider',
            vscode.Uri.file(location.filePath)
        ); 

        if(!symbols) {
            vscode.window.showErrorMessage(`Symbols für Objekt ${entry.objectId} nicht gefunden`);
            await openEditor(0, location);
            return;
        }

        const childnodes = symbols[0].children ?? [];

        

        for (const node of childnodes) {
            if (node.name.includes(`${entry.method}`)) {
                await openEditor(node.range.start.line, location);
                return;
            }
        }
    }

    // -------------------------
    // 📦 .app Datei
    // -------------------------
    if (location.type === "app") {

    }
}
async function openEditor(lineNo: number, location: any) {
    const pos = new vscode.Position(lineNo, 0);
    const doc = await vscode.workspace.openTextDocument(location.filePath);
    const editor = await vscode.window.showTextDocument(doc);
    editor.selection = new vscode.Selection(pos, pos);
    editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
}