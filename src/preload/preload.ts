import "./bridge";
import "./capturer";
import "./patch";
import * as fs from "fs";
import * as path from "path";
import {injectHummusTitlebar, injectTitlebar} from "./titlebar";
import {sleep, addStyle, injectJS, addScript} from "../utils";
import {ipcRenderer} from "electron";
import {injectMobileStuff} from "./mobile";
var version = ipcRenderer.sendSync("get-app-version", "app-version");
async function updateLang() {
    if (window.location.href.indexOf("setup.html") > -1) {
        console.log("Setup, skipping lang update");
    } else {
        addScript(`function getDiscordLang() {
            {const _w=webpackChunkdiscord_app;let lang;_w.push([[Symbol()],{},e=>{for(const k in e.c){const m=e.c[k].exports;const mDef=m?.default&&m.__esModule?m.default:m;if(mDef?._chosenLocale&&!lang)lang=mDef}}]);_w.pop();window.armcord.setLang(lang._chosenLocale);return lang._chosenLocale;void 0}}
            getDiscordLang();`);
    }
}
declare global {
    interface Window {
        armcord: any;
    }
}
const clientMods = {
    goosemod: "https://api.goosemod.com/inject.js",
    cumcord: "https://raw.githubusercontent.com/Cumcord/Cumcord/stable/dist/build.js",
    flicker: "https://raw.githubusercontent.com/FlickerMod/dist/main/build.js",
    cordwood: "https://raw.githubusercontent.com/Cordwood/builds/master/index.js"
};

console.log("ArmCord " + version);
ipcRenderer.on("themeLoader", (event, message) => {
    addStyle(message);
});
if (window.location.href.indexOf("splash.html") > -1) {
    console.log("Skipping titlebar injection and client mod injection.");
} else {
    if (ipcRenderer.sendSync("titlebar")) {
        if (ipcRenderer.sendSync("channel")) {
            injectHummusTitlebar();
        } else {
            injectTitlebar();
        }
    }
    if (ipcRenderer.sendSync("mobileMode")) {
        injectMobileStuff();
    }
    sleep(5000).then(async () => {
        const cssPath = path.join(__dirname, "../", "/content/css/discord.css");
        addStyle(fs.readFileSync(cssPath, "utf8"));

        switch (ipcRenderer.sendSync("clientmod")) {
            case "goosemod":
                injectJS(clientMods.goosemod);
                console.log("Loading GooseMod...");
                await updateLang();
                break;
            case "cumcord":
                injectJS(clientMods.cumcord);
                console.log("Loading Cumcord...");
                await updateLang();
                break;
            case "flicker":
                injectJS(clientMods.flicker);
                console.log("Loading FlickerMod...");
                await updateLang();
                break;
            case "cordwood":
                injectJS(clientMods.cordwood);
                console.log("Loading Cordwood...");
                await updateLang();
                break;
        }
    });
}
/*
MIT License

Copyright (c) 2022 GooseNest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
// Settings info version injection
setInterval(() => {
    const host = document.getElementsByClassName("info-3pQQBb")[0];
    if (!host || document.querySelector("#ac-ver")) return;
    const el = document.createElement("span");
    el.id = "ac-ver";
    el.classList.add("text-xs-normal-3SiVjE", "line-18uChy");

    el.textContent = `\nArmCord Version: ${version}`;
    el.onclick = () => ipcRenderer.send("openSettingsWindow");
    host.append(el);
}, 2000);
