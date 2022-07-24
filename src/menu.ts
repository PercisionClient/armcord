import { Menu, app, clipboard, globalShortcut } from "electron";
import {mainWindow} from "./window";
import {getConfig} from "./utils";

function paste(contents: any) {
    const contentTypes = clipboard.availableFormats().toString();
    //Workaround: fix pasting the images.
    if(contentTypes.includes('image/') && contentTypes.includes('text/html')) {
        clipboard.writeImage(clipboard.readImage());
    }
    contents.paste();
}
export async function setMenu() {
    if (await getConfig("alternativePaste") == true) {
        mainWindow.on("focus", function () {
            console.log("[Window state manager] Focus")
            globalShortcut.register("CmdOrCtrl+V", function () {
                if (mainWindow.isFocused()) {
                    paste(mainWindow.webContents)
                }
            })
        })
        mainWindow.on("show", function () {
            console.log("[Window state manager] Show")
            mainWindow.focus()
            globalShortcut.register("CmdOrCtrl+V", function () {
                if (mainWindow.isFocused()) {
                    paste(mainWindow.webContents)
                }
            })
        })
        mainWindow.on("blur", function () {
            console.log("[Window state manager] Defocus")
            globalShortcut.unregister("CmdOrCtrl+V")
        })
        mainWindow.on("hide", function () {
            console.log("[Window state manager] Hide")
            globalShortcut.unregister("CmdOrCtrl+V")
        })
    }
    var template: Electron.MenuItemConstructorOptions[] = [{
        label: "ArmCord",
        submenu: [
            {label: "About ArmCord", role: "about"},//orderFrontStandardAboutPanel
            {type: "separator"},
            {
                label: "Developer tools", accelerator: "CmdOrCtrl+Shift+I", click: function () {
                    mainWindow.webContents.openDevTools()
                }
            },
            {
                label: "Quit", accelerator: "CmdOrCtrl+Q", click: function () {
                    app.quit();
                }
            }
        ]
    }, {
        label: "Edit",
        submenu: [
            {label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo"},
            {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo"},
            {type: "separator"},
            {label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut"},
            {label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy"},
            {
                label: "Paste", accelerator: "CmdOrCtrl+V", click: function () {
                    paste(mainWindow.webContents)
                }
            },
            {label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectAll"}
        ]
    }
    ]

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}