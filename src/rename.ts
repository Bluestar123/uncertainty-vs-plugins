import * as vscode from 'vscode';
const fs = require('fs');
const path = require('path');
const fileTypes = ["js", "wxss", "wxml", "json"];

// 获取输入的内容
async function getInfo() {
  const result = await vscode.window.showInputBox({
		value: '',
		placeHolder: '请输入新的文件名',
		validateInput: (text: string) => {
      const reg = new RegExp("^[a-zA-Z]");
      if (!text) {
        return '输入内容不能为空';
      } else if (!reg.test(text)) {
        return '首字母请用英文';
      } else if (text.includes('\\') || text.includes('/')) {
        return '请输入正确格式';
      } else {
        return null;
      }
		}
  });
  return result;
}

function activateRename(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "wx" is now active!');
  let disposable = vscode.commands.registerCommand("uncertainty-plugin-demo.rename", async (e: vscode.Uri) => {
    const stat = fs.statSync(e.fsPath);
    if (stat.isFile()) {
      let res = await getInfo();

      let p = e.fsPath.substring(0, e.fsPath.lastIndexOf('.'));

      fileTypes.forEach(type => {
        let temp = p + '.' + type;
        if (fs.statSync(temp).isFile()) {
          let t = p.slice(0, p.lastIndexOf('\\') + 1);
          let te = t + res + '.' + type;

          fs.renameSync(temp, te);
        }
      });
      vscode.window.showInformationMessage(`重命名成功，请手动修改 app.json 中的路径`);
    } else {
      vscode.window.showErrorMessage("please choose a file");
    }
  });
  context.subscriptions.push(disposable);
}

function deactivate() { }
export { activateRename, deactivate };