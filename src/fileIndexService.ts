import * as vscode from "vscode";
import * as fs from "fs";

type Location =
    | { type: "local"; filePath: string }
    | { type: "app"; filePath: string };

export class FileIndexService {

    private objectIndex = new Map<string, Location>();

    constructor(private workspaceRoot: string) {}

    async buildIndex() {
        await this.indexLocalFiles(); 

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

                const match = content.match(/(table|tableextension|page|pageextension|codeunit|report|reportextension|enum|enumextension|query|xmlport)\s+(\d+)/i);

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
}

export function buildKey(type: string, objectId: number): string {
    return `${type.toLowerCase()}:${objectId}`;
}