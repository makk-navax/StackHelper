import * as vscode from "vscode";
import AdmZip from "adm-zip";
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

        const doc = await vscode.workspace.openTextDocument(location.filePath);
        const editor = await vscode.window.showTextDocument(doc);

        const pos = new vscode.Position(entry.line - 1, 0);
        editor.revealRange(new vscode.Range(pos, pos));

        return;
    }

    // -------------------------
    // 📦 .app Datei
    // -------------------------
    if (location.type === "app") {

        const zip = new AdmZip(location.appPath);
        const entryZip = zip.getEntry(location.entryName);

        if (!entryZip) {
            vscode.window.showErrorMessage("Eintrag nicht gefunden in .app");
            return;
        }

        const content = entryZip.getData().toString("utf8");

        const doc = await vscode.workspace.openTextDocument({
            content,
            language: "al"
        });

        const editor = await vscode.window.showTextDocument(doc);

        const pos = new vscode.Position(entry.line - 1, 0);
        editor.revealRange(new vscode.Range(pos, pos));
    }
}