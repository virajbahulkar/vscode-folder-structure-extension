"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// extension.ts
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fileUtils_1 = require("./fileUtils");
function activate(context) {
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
            }
            else if (useClipboard === 'No') {
                structureInput = await vscode.window.showInputBox({
                    prompt: 'Enter folder structure manually',
                }) || '';
            }
            else {
                // Prompt was closed without selection
                return;
            }
        }
        else {
            structureInput = await vscode.window.showInputBox({
                prompt: 'Enter folder structure or paste it here. Use indents or slash-separated format.',
                placeHolder: 'Example: src/components/Button.tsx\nsrc/utils/helpers.ts'
            }) || '';
        }
        if (!structureInput.trim()) {
            vscode.window.showErrorMessage('No folder structure input provided.');
            return;
        }
        const pathsToCreate = (0, fileUtils_1.parseStructure)(structureInput);
        for (const relativePath of pathsToCreate) {
            const fullPath = path.join(workspacePath, relativePath);
            if (fullPath.endsWith('/')) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
            else if (path.extname(fullPath)) {
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, '');
            }
            else {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        }
        vscode.window.showInformationMessage('Folder structure created successfully!');
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map