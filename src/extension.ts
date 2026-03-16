// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

class ViewProvider implements vscode.WebviewViewProvider {

    constructor(private readonly extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView
    ) {
        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this.getHtml();
    }

    private  getHtml(): string {
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
				const callstack = parseCallstack(text);
				}
        	</script>

      </body>
      </html>
    `;
  }
}

function parseCallstack(errorText: string): string[] {

	const lines = errorText.split("\n");

  	const stackLines = lines.filter(line =>
    line.trim().startsWith("at ")
  	);
	vscode.window.showInformationMessage("Callstack ausgelesen test" + stackLines.length);
  	return stackLines;
}

export function activate(context: vscode.ExtensionContext) {

	const provider = new ViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "stackhelper-view",
            provider
        )
    );
}

export function deactivate() {}
