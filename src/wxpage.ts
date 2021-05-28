import { dir } from 'console';
import * as vscode from 'vscode';
const fs = require('fs');
const path = require('path');
const file = require('./file');
const fileTypes = ["js", "wxss", "wxml", "json"];

//递归创建目录 同步方法
function mkdirsSync(dirname: string) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

interface PackageProp {
  root: string;
  pages: string[]
}
// 路径添加到 app.json 中
function addPathToJSON(url: string, dir: string) {
  const dirname = 'app.json';
  let pkgIndex = url.search('pkg');
  let pkgName = '';
  let tempIndex = -1;
  if (pkgIndex !== -1) {
    // 是分包
    let tempUrl = url.slice(pkgIndex);
    tempIndex = tempUrl.search('\\\\');
    pkgName = tempUrl.slice(0, tempIndex);
  }
  let flag = true;
  while (flag) {
    let temp = path.resolve(url, dirname);
    let res = fs.existsSync(temp);
    if (res) {
      const lastIndex = temp.lastIndexOf('\\');
      flag = false;
      // 二进制数据转为字符串
      let content = fs.readFileSync(temp).toString();
      content = JSON.parse(content);
      console.log(content);

      if (pkgName) {
        // 有分包
        let subPackages = content.subpackages || [];
        let i = subPackages.findIndex((item: PackageProp) => {
          return item.root === pkgName;
        });
        if (i > -1) {
        } else {
          subPackages.push({
            "root": pkgName,
            "pages": []
          });
          i = subPackages.length - 1;
        }
        subPackages[i].pages.push(dir.slice(dir.search(pkgName) + pkgName.length + 1).replace(/\\/g, '/'));
        content.subPackages = subPackages;
      } else {
        // 无分包
        content.pages.push(dir.slice(lastIndex + 1).replace(/\\/g, '/'));
      }
      let str = JSON.stringify(content, null, 2);
      fs.writeFileSync(temp, str);
    } else {
      url = url.slice(0, url.lastIndexOf('\\'));
    }
  }
}

async function wxCommandHander(e: vscode.Uri) {
  const result = await vscode.window.showInputBox({
		value: '',
		placeHolder: '请输入文件名 index 或目录格式 index/index',
		validateInput: (text: string) => {
      const reg = new RegExp("^[a-zA-Z]");
      if (!text) {
        return '输入内容不能为空';
      } else if (!reg.test(text)) {
        return '首字母请用英文';
      } else if (text.includes('\\')) {
        return '请输入正确格式';
      } else {
        return null;
      }
		}
  });

  const stat = fs.statSync(e.fsPath);
  const dir = path.resolve(e.fsPath, result);
  // 已有文件 不能创建
  if (fs.existsSync(dir + '.js')) {
    vscode.window.showErrorMessage("file exists in the folder, please create another file");
    return;
  }
  if (result?.split('/').length) {
    mkdirsSync(path.resolve(e.fsPath, result.slice(0, result.lastIndexOf('/') + 1)));
  }

  if (stat.isDirectory()) {
    try {
      fileTypes.map(i => {
        let temp = result?.split('/') || [];
        const data = new Uint8Array(Buffer.from(file.files(temp[temp.length - 1]).page[i]));
        fs.writeFileSync(`${dir}.${i}`, data);
      });
      // 给app.json添加路径
      addPathToJSON(e.fsPath, dir!);

      vscode.window.showInformationMessage(`create page success!`);
    } catch (error) {
      vscode.window.showErrorMessage("create page files failed");
    }
  } else {
    vscode.window.showErrorMessage("please choose a folder");
  }
}

function activateWX(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "wx" is now active!');
  let disposable = vscode.commands.registerCommand("uncertainty-plugin-demo.wxPage", (e: vscode.Uri) => {
      wxCommandHander(e);
  });
  context.subscriptions.push(disposable);
  // disposable = vscode.commands.registerCommand("uncertainty-plugin-demo.wxComponents", (e: vscode.Uri) => {
  //     wxCommandHander("components", e);
  // });
  // context.subscriptions.push(disposable);
}

function deactivate() { }
export { activateWX, deactivate };