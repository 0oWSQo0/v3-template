'use strict'
const n = require('electron'),
  o = require('path'),
  t = () => {
    const e = new n.BrowserWindow({ width: 960, height: 600, webPreferences: { nodeIntegration: !0, contextIsolation: !1 } })
    process.env.VITE_DEV_SERVER_URL ? e.loadURL(process.env.VITE_DEV_SERVER_URL) : e.loadFile(o.join(__dirname, 'index.html')), console.log('中文！！')
  }
n.app.whenReady().then(t)
