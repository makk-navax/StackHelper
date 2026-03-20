// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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

				this.callStackProvider?.update(message.payload);

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

    constructor(private readonly extensionUri: vscode.Uri) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this.view = webviewView;

        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = getCallStackHtml();

		webviewView.webview.onDidReceiveMessage(message => {
        	if (message.command === "openFile") {
            	openFileAtLine(message.file, message.line);
        	}
    	});
    }

    update(data: string) {
        this.view?.webview.postMessage({
            type: "update",
            payload: data
        });
    }
}

async function openFileAtLine(file: string, line: number) {
    const uri = vscode.Uri.file(file);

    const doc = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(doc);

    const position = new vscode.Position(line - 1, 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position));
}

function parseCallstack(errorText: string): string[] {

    const lines = errorText.split("\n");

    const startIndex = lines.findIndex(line =>
        line.trim().startsWith("Aufrufliste")
    );

    if (startIndex === -1) {
        return [];
    }

    const stackLines = lines
        .slice(startIndex + 1)
        .map(line => line.trim())
        .filter(line => line.length > 0);

    vscode.window.showInformationMessage(
        "Callstack ausgelesen: " + stackLines.length
    );

    return stackLines;
}

function renderCallstack(stack: any[]): string {
    return stack.map((entry, index) => {
        return `
        <div>
            ${entry.raw}
            <a href="#" onclick="openFile('${entry.file}', ${entry.line})"></a>
        </div>
        `;
    }).join("");
}

export function activate(context: vscode.ExtensionContext) {

	const stackHelperProvider = new StackHelperViewProvider(context.extensionUri);
	const callStackProvider = new CallStackViewProvider(context.extensionUri);

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

        	<pre id="output"></pre>

        	<script>
          		const vscode = acquireVsCodeApi();

          		function showCallStack(){
            	const text = document.getElementById("errorText").value;

				vscode.postMessage({
      				command: "parse",
      				text: text
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
			
		</body>
	</html>
	`;
}

