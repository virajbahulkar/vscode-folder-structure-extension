// extension.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { parseStructure } from './fileUtils';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.createStructure', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('Please open a workspace folder first.');
      return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const clipboard = await vscode.env.clipboard.readText();
    let structureInput = '';

    if (clipboard.trim()) {
      const useClipboard = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Detected folder structure in clipboard. Do you want to use it?',
        canPickMany: false,
      });

      if (useClipboard === 'Yes') {
        structureInput = clipboard.trim();
      } else if (useClipboard === 'No') {
        structureInput = await vscode.window.showInputBox({
          prompt: 'Enter folder structure manually (Example: src/components/Button.tsx, Modal.tsx+src/utils/helpers.ts, services.ts or Example: src/components/Button.tsx, Modal.tsx+hooks/useApi.js, useData.js',
        }) || '';
      } else {
        // Prompt was closed without selection
        return;
      }
    } else {
      structureInput = await vscode.window.showInputBox({
        prompt: 'Enter folder structure or paste it here. See the example.',
        placeHolder: 'Example: src/components/Button.tsx, Modal.tsx+src/utils/helpers.ts, services.ts or Example: src/components/Button.tsx, Modal.tsx+hooks/useApi.js, useData.js'
      }) || '';
    }

    if (!structureInput.trim()) {
      vscode.window.showErrorMessage('No folder structure input provided.');
      return;
    }

    const pathsToCreate = parseStructure(structureInput);

    for (const relativePath of pathsToCreate) {
      const fullPath = path.join(workspacePath, relativePath);
      if (fullPath.endsWith('/')) {
        fs.mkdirSync(fullPath, { recursive: true });
      } else if (path.extname(fullPath)) {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, '');
      } else {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }

    vscode.window.showInformationMessage('Folder structure created successfully!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() { }
