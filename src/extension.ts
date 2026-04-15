import * as vscode from 'vscode';
import { openCallstackEntry } from './openCallstackEntry';
import { FileIndexService } from './fileIndexService';

class StackHelperViewProvider implements vscode.WebviewViewProvider {

	private view?: vscode.WebviewView;
    private callStackProvider?: CallStackViewProvider;

    constructor(private readonly extensionUri: vscode.Uri) {}

	setCallStackProvider(provider: CallStackViewProvider) {
		this.callStackProvider = provider;
	}

    resolveWebviewView(webviewView: vscode.WebviewView) {
		this.view = webviewView;

        webviewView.webview.options = { enableScripts: true };

        webviewView.webview.html = getStackHelperHtml();

		webviewView.webview.onDidReceiveMessage(message => {
        	if (message.command === "parse") {
            	const stack = parseCallstack(message.text);
            	const html = renderCallstack(stack);

				this.callStackProvider?.update(stack);

            	webviewView.webview.postMessage({
                	command: "render",
                	html
            	});
        	}
    	});
    }	
}

export class CallStackViewProvider implements vscode.WebviewViewProvider {

    private view?: vscode.WebviewView;
	private index: FileIndexService;

    constructor(private readonly extensionUri: vscode.Uri, index: FileIndexService) {
    	this.index = index;
	}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this.view = webviewView;

        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = getCallStackHtml();

		webviewView.webview.onDidReceiveMessage(async message => {
        	if (message.command === "openFile") {
				const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

        	if (!workspaceRoot) 
				return;

        	await openCallstackEntry(message.payload, this.index);
        	}
    	});
    }

    update(stack: any[]) {
        const html = renderCallstack(stack);

    	this.view?.webview.postMessage({
        	type: "render",
        	html
    	});
    }
}

function parseCallstack(errorText: string): string[] {

    const lines = errorText.split("\n");

    const startIndex = lines.findIndex(line =>
        line.trim().includes("Aufrufliste")
    );

    if (startIndex === -1) {
        return [];
    }

    const stackLines = lines
        .slice(startIndex + 1)
        .map(line => line.trim())
        .filter(line => line.length > 0);

	const parsed = stackLines.map(line => {

        const cleaned = line.replace(/-$/, "").trim();

        const regex = /"(.+?)"\((\w+)\s+(\d+)\)\.(.+?) line (\d+)/i;
        const match = cleaned.match(regex);

        if (!match) {
            return undefined;
        }

        return {
    		name: escapeAttr(match[1]),
    		type: escapeAttr(match[2].toLowerCase()),
    		objectId: Number(match[3]),
    		method: escapeAttr(match[4]),
    		line: Number(match[5])
		};
    }).filter(Boolean) as any[];

    return parsed;
}

function renderCallstack(stack: any[]): string {
    return stack.map((entry) => {
        return `
        <div class="callstack-entry" style="margin-bottom:6px;">
            <a href="#" class="callstack-link" onclick="console.log('click'); openFile('${entry.name}', '${entry.type}',${entry.objectId}, '${entry.method}', ${entry.line})">
                ${entry.name}
                <span style="opacity:0.7">(${entry.objectId})</span>
                <span style="margin-left:6px;">${entry.method}</span>
                <span style="margin-left:6px;">→ Zeile ${entry.line}</span>
            </a>
        </div>

		<style>
			.callstack-link {
    			display: block;
    			padding: 5px;
    			border-radius: 3px;
    			text-decoration: none;
    			color: inherit;
			}

			.callstack-link:hover {
    			background-color: rgba(255,255,255,0.05);
			}
		</style>
        `;
    }).join("");
}

export async function activate(context: vscode.ExtensionContext) {
	const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

    if (!workspaceRoot) 
		return;

	const index = new FileIndexService(workspaceRoot);

	await index.buildIndex();

	const stackHelperProvider = new StackHelperViewProvider(context.extensionUri);
	const callStackProvider = new CallStackViewProvider(context.extensionUri, index);

	stackHelperProvider.setCallStackProvider(callStackProvider);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider("stackhelper-view", stackHelperProvider),
		vscode.window.registerWebviewViewProvider("stackhelper-callstack", callStackProvider)
    );
}

export function deactivate() {}

export function getStackHelperHtml(): string {
    return `
      	<html>
      	<body>
			<style>

			body {
				display:flex;
          		flex-direction:column;
  				height: 100vh;
  				margin: 0;

  				font-family: var(--vscode-font-family);
			}

			textarea {
				width:100%;
				margin-bottom:10px;
				margin-top:10px;
  				background-color: var(--vscode-input-background);
  				color: var(--vscode-input-foreground);
			}

			button {
  				background-color: var(--vscode-button-background);
  				color: var(--vscode-button-foreground);
  				border: none;
  				padding: 6px;
				margin-bottom:10px;
				border-radius: 4px;
			}

			button:hover {
  				background-color: var(--vscode-button-hoverBackground);
			}

			#output{
  				flex:1;
  				overflow:auto;
  				border-top:1px solid gray;
			}

			</style>

        	<textarea id="errorText" rows="12" style="width:100%" placeholder="Fehlermeldung hier eingeben..."></textarea>

        	<button onclick="showCallStack()">Call-Stack auslesen</button>

			<br>

			<button onclick="clearCallstack()">Eingabe löschen</button>

        	<pre id="output"></pre>

        	<script>
          		const vscode = acquireVsCodeApi();

				const state = vscode.getState();
    			if (state) {
        			document.getElementById("errorText").value = state.text || "";
					showCallStack();
    			}

          		function showCallStack(){
            		const text = document.getElementById("errorText").value;

					vscode.setState({ text });

					vscode.postMessage({
      					command: "parse",
      					text: text
    				});
  				}

				function clearCallstack() {
					document.getElementById("errorText").value = "";

					vscode.setState({ text: "" });

					vscode.postMessage({
	  					command: "parse",
	  					text: ""
					});
				}
        	</script>

      </body>
      </html>
    `;
	}

export function getCallStackHtml(): string {
	return `
	<html>
    	<body>
			<div id="content"></div>

        	<script>
            	const vscode = acquireVsCodeApi();

            	window.addEventListener("message", (event) => {
                	const message = event.data;

                	if (message.type === "render") {
                    	document.getElementById("content").innerHTML = message.html;
                	}
            	});

            	function openFile(name, type, objectId, method, line) {
                	vscode.postMessage({
                    	command: "openFile",
                    	payload: { name, type, objectId, method, line }
                	});
            	}
        	</script>
		</body>
	</html>
	`;
}

function escapeAttr(str: string) {
  	return str
    	.replace(/'/g, "\\'")
    	.replace(/"/g, "&quot;");
}