// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var D = require('../utl/dom.js').DomUtl;
var I = require('../utl/icon.js').IconUtl;

var QrScanner = require('qr-scanner');
QrScanner.WORKER_PATH = "js/qr-scanner-worker.min.js";

class ScanScreen {
    constructor(app_div) {
        this.app_div = app_div;
        this.onbackclick = null;
        this.onscanresult = null;
        this.video_div = null;
        this.scanner = null;
        this.paste_input = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Scanning
    ///////////////////////////////////////////////////////////////////////////

    startScanning() {
        this.scanner.start();
        this.canvas = this.scanner.$canvas;

        D.deleteChildren(this.video_div);

        D.setClass(this.canvas, "w-full rounded-lg");
        this.video_div.appendChild(this.canvas);
    }

    stopScanning() {
        if (this.scanner != null) {
            this.scanner.stop();
        }
        D.deleteChildren(this.video_div);
    }

    scanResult(result) {
        console.log("scan result: " + result);
        this.stopScanning();
        if (this.onscanresult != null) {
            this.onscanresult(result.toLowerCase());
        }
    }

    pasteResult() {
        var paste_string = this.paste_input.value;
        console.log("paste: " + paste_string);
        this.stopScanning();
        if (this.onscanresult != null) {
            this.onscanresult(paste_string.toLowerCase());
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////

    drawBackButton(div, back_func) {
        var b = D.button(div, back_func, "main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var icon_span = D.emptySpan(flex, "px-2");
        var back = I.backarrow2x(icon_span);
        var text = D.textSpan(flex, "Back");
    }

    drawPasteButton(div, paste_func) {
        var b = D.button(div, paste_func, "p-2 main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        D.textSpan(flex, "Use");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        D.textParagraph(flex, "SCAN QR:",
                        "font-black text-2xl text-yellow-800");
    }

    drawTitlePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-wrap section-background");
        var button_flex = D.emptyDiv(flex, "flex-initial px-2");
        var title_flex = D.emptyDiv(flex, "flex-initial px-5 py-2");

        this.drawBackButton(button_flex, this.onbackclick);
        this.drawTitle(title_flex);
    }

    drawPastePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-col section-background");
        var paste = D.emptyDiv(flex,
                               "flex justify-center items-center " +
                               "bg-yellow-500 px-2 py-2 m-2 rounded");
        this.paste_input = D.emptyInput(paste,
            "flex-initial w-auto appearance-none rounded shadow " +
            "p-3 text-grey-dark mr-2 focus:outline-none");
        this.paste_input.setAttribute("placeholder", "beacon or bolt11");
        var button_flex = D.emptyDiv(paste, "flex-initial");
        this.drawPasteButton(button_flex,
                             (function() { this.pasteResult()}).bind(this));

    }

    drawCameraInstructions(div) {
        var text = ("You must grant permission for camera access. " +
            "Ensure that a) the browser has permission from the OS to " +
            "access the camera and b) the page has permission from the " +
            "browser.");
        D.textParagraph(div, text, "font-black text-2xl text-yellow-800");
    }

    drawScanVideo(div) {
        this.video_div = D.emptyDiv(div, "px-2 section-background");
        this.drawCameraInstructions(this.video_div);
        //var video = D.emptyVideo(flex, "flex-grow rounded border-2");

        var v = document.createElement("video");


        this.scanner = new QrScanner(v, (function(result) {
            this.scanResult(result);
        }).bind(this));
    }


    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////


    draw() {
        //console.log("path: " + QrScanner.WORKER_PATH);
        var flex = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(flex, "flex-none");
        this.drawTitlePanel(flex_top);

        var flex_mid = D.emptyDiv(flex, "flex-grow");
        this.drawScanVideo(flex_mid);
        var flex_bottom = D.emptyDiv(flex, "flex-none");
        this.drawPastePanel(flex_bottom);
    }
}

exports.ScanScreen = ScanScreen;
