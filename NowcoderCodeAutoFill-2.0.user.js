// ==UserScript==
// @name         NowcoderCodeAutoFill
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  牛客 Monaco 编辑器自动填充代码模板
// @author       pikaka
// @match        https://www.nowcoder.com/practice/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    /* ================= 设置语言模板，这里以cpp和py为例，后续可以根据自己情况设置 ================= */

    const TEMPLATES = {
        cpp: `#include <bits/stdc++.h>
using namespace std;

using ll = long long;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    return 0;
}`,
        python: `import math
import random
from functools import reduce, total_ordering
from collections import Counter, defaultdict, deque
from heapq import merge, heapify, heappop, heappush, heappushpop, nlargest, nsmallest, heapreplace

def I():
    return int(input())

def MI():
    return map(int, input().split())

def LI():
    return list(map(int, input().split()))

def LLI(n):
    return [list(map(int, input().split())) for _ in range(n)]

def S():
    return input()

def LS():
    return input().split()

def LLS(n):
    return [input() for _ in range(n)]

def debug(*args, **kwargs):
    print('\\033[92m', end='')
    print(*args, **kwargs)
    print('\\033[0m', end='')

inf = math.inf
rng = random.getrandbits(20)
fmax = lambda x, y: x if x > y else y
fmin = lambda x, y: x if x < y else y

`,
    };

    /* ================= 牛客的默认语言模板，用于区分是否为自己写的代码，防止误删 ================= */

    const NOWCODERTEMPLATES = {
        cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    while (cin >> a >> b) { // 注意 while 处理多个 case
        cout << a + b << endl;
    }
}
// 64 位输出请用 printf("%lld")
`,
        python: `import sys

for line in sys.stdin:
    a = line.split()
    print(int(a[0]) + int(a[1]))
`,
    };

    const DEFAULTLANG = 'Unknown'; // 默认返回语言语言
    const LEN = 200; // 模拟用户光标移动和删除的次数

    function getCurrentLanguage() {
        const selected = document.querySelector(
            '.el-select-dropdown__item.selected span'
        );
        if (!selected) return DEFAULTLANG;

        const text = selected.textContent.trim().toLowerCase();

        if (text.includes('c++')) return 'cpp';
        if (text.includes('python') || text.includes('pypy')) return 'python';

        return DEFAULTLANG;
    }


    function findEditorNode() {
        return document.querySelector(
            '.monaco-editor textarea, .monaco-editor [contenteditable="true"]'
        );
    }


    function pasteText(node, text) {
        node.focus();

        // 创建光标右移事件
        const rightDownEvent = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            code: 'ArrowRight',
            keyCode: 39,
            which: 39,
            bubbles: true,
            cancelable: true,
            altKey: false,
            ctrlKey: false,
            shiftKey: false,
            metaKey: false
        });

        // 创建右箭头键松开事件
        const rightUpEvent = new KeyboardEvent('keyup', {
            key: 'ArrowRight',
            code: 'ArrowRight',
            keyCode: 39,
            which: 39,
            bubbles: true,
            cancelable: true,
            altKey: false,
            ctrlKey: false,
            shiftKey: false,
            metaKey: false
        });

        // 创建 delete 事件
        const deleteDownEvent = new KeyboardEvent('keydown', {
            key: 'Backspace',
            code: 'Backspace',
            keyCode: 8,
            which: 8,
            bubbles: true,
            cancelable: true,
            altKey: false,
            ctrlKey: false,
            shiftKey: false,
            metaKey: false
        });
        const deleteUpEvent = new KeyboardEvent('keyup', {
            key: 'Backspace',
            code: 'Backspace',
            keyCode: 8,
            which: 8,
            bubbles: true,
            cancelable: true,
            altKey: false,
            ctrlKey: false,
            shiftKey: false,
            metaKey: false
        });
        
        const data = new DataTransfer();
        data.setData('text/plain', text);
        
        // 创建 paste 事件
        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: data,
            bubbles: true,
            cancelable: true
        });

        for (let i = 0; i < LEN; i += 1) {
            node.dispatchEvent(rightDownEvent);
            node.dispatchEvent(rightUpEvent);
        }
        for (let i = 0; i < LEN; i += 1) {
            node.dispatchEvent(deleteDownEvent);
            node.dispatchEvent(deleteUpEvent);
        }
        node.dispatchEvent(pasteEvent);
    }

    const timer = setInterval(() => {
        const editorNode = findEditorNode();
        if (!editorNode) return;

        const lang = getCurrentLanguage();

        if (!(lang in TEMPLATES)) {
            console.log("该语言未提供模板");
            clearInterval(timer);
            return;
        }

        const template = TEMPLATES[lang] || TEMPLATES[DEFAULTLANG];

        // 防止已有代码被覆盖
        if (editorNode.value && editorNode.value.trim() !== '' && editorNode.value.trim() != NOWCODERTEMPLATES[lang].trim()) {
            clearInterval(timer);
            return;
        }

        pasteText(editorNode, template);
        clearInterval(timer);
    }, 500);

})();
