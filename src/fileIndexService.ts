import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import AdmZip from "adm-zip";

type Location =
    | { type: "local"; filePath: string }
    | { type: "app"; appPath: string; entryName: string };

export class FileIndexService {

    private objectIndex = new Map<string, Location>();

    constructor(private workspaceRoot: string) {}

    async buildIndex() {
        await this.indexLocalFiles();
        await this.indexAppFiles();

        vscode.window.showInformationMessage(
            `Index gebaut: ${this.objectIndex.size} Objekte`
        );
    }

    get(key: string): Location | undefined {
        return this.objectIndex.get(key);
    }

    // -------------------------
    // Index lokale Dateien
    // -------------------------
    private async indexLocalFiles() {

        const files = await vscode.workspace.findFiles("**/*.al");

        for (const file of files) {
            try {
                const content = fs.readFileSync(file.fsPath, "utf8");

                const match = content.match(/(table|page|codeunit|report|enum|query|xmlport)\s+(\d+)/i);

                if (match) {
                    const type = match[1].toLowerCase();
                    const objectId = Number(match[2]);

                    const key = buildKey(type, objectId);

                    this.objectIndex.set(key, {
                        type: "local",
                        filePath: file.fsPath
                    });
                }   
            } catch (err) {
                console.error("Fehler beim Lesen:", file.fsPath);
            }
        }
    }

    // -------------------------
    // Index .app Dateien
    // -------------------------
    private async indexAppFiles() {

        const appDir = path.join(this.workspaceRoot, ".alpackages");

        if (!fs.existsSync(appDir)) return;

        const files = fs.readdirSync(appDir).filter(f => f.endsWith(".app"));

        for (const file of files) {

            const fullPath = path.join(appDir, file);

            try {
                const zip = new AdmZip(fullPath);

                for (const entry of zip.getEntries()) {

                    if (!entry.entryName.endsWith(".al")) continue;

                    const content = entry.getData().toString("utf8");

                    const match = content.match(/(table|page|codeunit|report|enum|query|xmlport)\s+(\d+)/i);

                    if (match) {
                        const type = match[1].toLowerCase();
                        const objectId = Number(match[2]);

                        const key = buildKey(type, objectId);

                        this.objectIndex.set(key, {
                            type: "app",
                            appPath: fullPath,
                            entryName: entry.entryName
                        });
                    }
                }

            } catch (err) {
                console.error("Fehler in .app:", file);
            }
        }
    }
}

export function buildKey(type: string, objectId: number): string {
        return `${type.toLowerCase()}:${objectId}`;
    }