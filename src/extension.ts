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
    // Site content html
    const data = content.data,
      // Regexp for find all html tag <link>
      findLinkRegexp = /\<link\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g,
      // Regexp for find attribute href in <link>
      findLinkHrefRegexp = /href=\"(.*?)\"/,
      // All founded <link>
      links = data.match(findLinkRegexp);
    if (links && Array.isArray(links)) {
      // Css inline styles
      const cssStyles: string[] = [],
        // All axios promises for getting raw css
        cssPromises: Promise<any>[] = [];
      links.forEach((item) => {
        const needle = item.match(findLinkHrefRegexp);
        if (needle && Array.isArray(needle) && needle.hasOwnProperty('1')) {
          const cssUrl = url + '/' + needle[1];
          cssPromises.push(axios.get(cssUrl));
        }
      });
      if (cssPromises) {
        Promise.all(cssPromises).then((values) => {
          values.forEach((item) => {
            cssStyles.push(item.data);
          });
          console.log('cssStyles', cssStyles);
        });
      }
    }
  }).catch((e) => console.error(e));
}

/**
 * Get web content by URL
 */
function getWebContent(url: string): Promise<any> {
  return axios.get(url);
}
