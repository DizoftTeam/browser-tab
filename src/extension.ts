'use strict';

import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.browsertab', () => {
    vscode.window.showInputBox({
      prompt: 'Enter a site url. Example: http://localhost',
      value: 'http://',
      ignoreFocusOut: true,
      placeHolder: 'Site url',
      validateInput: (value: string): string => {
        return '';
      }
    }).then(url => {
      if (url) {
        const panel = vscode.window.createWebviewPanel(
          'browserTab',
          'browserTab',
          vscode.ViewColumn.Active, {
            enableScripts: true
          }
        );
        console.log('get from user', url);
        // Get HTML content of site
        getWebContent(url).then((content) => {
          // Convert link to style
          getStyles(url, content.data).then((styles) => {
            // Show data
            panel.webview.html = [
              styles,
              content.data
            ].join(' ')
          });
        }).catch((e) => {
          console.error('getWebContent error', e)
        });
      } else {
        vscode.window.showInformationMessage('The url can be specified! Do nothing');
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
}

/**
 * Convert <link> to <style>
 * @param {string} url Base url
 * @param {string} content HTML content by url
 */
function getStyles(url: string, content: string): Promise<string> {
  return new Promise<string>((resolve) => {
    // Regexp for find all html tag <link>
    const findLinkRegexp = /\<link\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g,
      // Regexp for find attribute href in <link>
      findLinkHrefRegexp = /href=\"(.*?)\"/,
      // All founded <link>
      links = content.match(findLinkRegexp);
    if (links && Array.isArray(links)) {
      // Css inline styles
      const cssStyles: string[] = [],
        // All axios promises for getting raw css
        cssPromises: Promise<any>[] = [];
      links.forEach((item) => {
        // Try find href attribute
        const needle = item.match(findLinkHrefRegexp);
        // If found
        if (needle && Array.isArray(needle) && needle.hasOwnProperty('1')) {
          // Build url for getting css
          const cssUrl = url + '/' + needle[1];
          cssPromises.push(axios.get(cssUrl));
        }
      });
      if (cssPromises) {
        // Getting all css's
        Promise.all(cssPromises).then((values) => {
          values.forEach((item) => {
            // Genetare inline style
            cssStyles.push([
              '<style type="text/css">',
              item.data,
              '</style>'
            ].join(' '));
          });
          resolve(cssStyles.join(' '))
        });
      }
    } else {
      resolve('')
    }
  });
}

/**
 * Get web content by URL
 */
function getWebContent(url: string): Promise<any> {
  return axios.get(url);
}
