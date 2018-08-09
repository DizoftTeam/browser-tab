'use strict';

import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.browsertab', () => {
    const panel = vscode.window.createWebviewPanel(
      'browserTab',
      'browserTab',
      vscode.ViewColumn.Active,
      {
        enableScripts: true
      }
    );
    // const url = 'http://localhost/page2.html';
    const url = 'http://localhost';
    getWebContent(url).then((content) => {
      panel.webview.html = content.data;
    });
    getBla(url);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
}

function getBla(url : string) {
  getWebContent(url).then((content) => {
    const data = content.data,
      findLinkRegexp = /\<link\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g,
      findLinkHrefRegexp = /href=\"(.*?)\"/,
      result = data.match(findLinkRegexp);
    if (result && Array.isArray(result)) {
      result.forEach((item) => {
        const needle = item.match(findLinkHrefRegexp);
        if (needle && Array.isArray(needle) && needle.hasOwnProperty('1')) {
          console.log('need load by', url + '/' + needle[1]);
        }
      });
    }
  }).catch((e) => console.error(e));
}

/**
 * Get web content by URL
 */
function getWebContent(url: string): Promise<any> {
  return axios.get(url);
}
