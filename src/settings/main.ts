import {BrowserWindow, shell, ipcMain, app, clipboard} from "electron";
import {getConfig, setConfigBulk, Settings, getLang, getVersion, getConfigLocation} from "../utils";
import path from "path";
import os from "os";
import fs from "fs";
var settingsWindow: BrowserWindow;
var instance: number = 0;
const userDataPath = app.getPath("userData");
const storagePath = path.join(userDataPath, "/storage/");
const themesPath = path.join(userDataPath, "/themes/");
const pluginsPath = path.join(userDataPath, "/plugins/");
export function createSettingsWindow() {
    console.log("Creating a settings window.");
    instance = instance + 1;
    if (instance > 1) {
        if (settingsWindow) {
            settingsWindow.show();
            settingsWindow.restore();
        }
    } else {
        settingsWindow = new BrowserWindow({
            width: 660,
            height: 670,
            title: "ArmCord Settings",
            darkTheme: true,
            frame: true,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, "preload.js")
            }
        });
        ipcMain.on("saveSettings", (event, args: Settings) => {
            console.log(args);
            setConfigBulk(args);
        });
        ipcMain.on("openStorageFolder", (event) => {
            shell.openPath(storagePath);
        });
        ipcMain.on("openThemesFolder", (event) => {
            shell.openPath(themesPath);
        });
        ipcMain.on("openPluginsFolder", (event) => {
            shell.openPath(pluginsPath);
        });
        ipcMain.handle("getSetting", (event, toGet: string) => {
            return getConfig(toGet);
        });
        ipcMain.on("copyDebugInfo", (event) => {
            let settingsFileContent = fs.readFileSync(getConfigLocation(), "utf-8");
            clipboard.writeText(
                "**OS:** " +
                    os.platform() +
                    " " +
                    os.version() +
                    "\n**Architecture:** " +
                    os.arch() +
                    "\n**ArmCord version:** " +
                    getVersion() +
                    "\n**Electron version:** " +
                    process.versions.electron +
                    "\n`" +
                    settingsFileContent +
                    "`"
            );
        });
        settingsWindow.webContents.setWindowOpenHandler(({url}) => {
            shell.openExternal(url);
            return {action: "deny"};
        });
        settingsWindow.loadURL(`file://${__dirname}/settings.html`);
        settingsWindow.on("close", (event: Event) => {
            ipcMain.removeHandler("getSetting");
            ipcMain.removeAllListeners("saveSettings");
            instance = 0;
        });
    }
}
