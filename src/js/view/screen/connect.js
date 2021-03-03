// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var D = require('../../utl/dom.js').DomUtl;
var I = require('../../utl/icon.js').IconUtl;

var Screen = require('./Screen');


class ConnectScreen extends Screen {
    constructor(app_div, model) { 
        super(app_div, model) ;

        this.onbbackclick = null;
        this.onbeaconselect = null;
        this.ongenerateselect = null;
        this.onscanselect = null;
        this.onforgetselect = null;
        this.onconnectstoredselect = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////


    drawPasteButton(div, paste_func) {
       this.drawButtonPlain(div, "Use", paste_func, "main-button");
    }

    drawGenerateButton(div, generate_func) {
       this.drawButton(div, I.magic2x, "Generate", generate_func, "main-button");
    }

    drawScanButton(div, scan_func) {
        this.drawButton(div, I.qrcode2x, "Scan", scan_func, "main-button");
    }

    drawConnectStoredButton(div, connect_func) {
        this.drawButton(div, I.bolt2x, "Connect", connect_func, "main-button");
    }

    drawForgetButton(div, forget_func) {
        this.drawButton(div, I.trash2x, "Forget", forget_func, "main-button");
    }

    pasteResult() {
        var paste_string = this.paste_input.value;
        if (this.onbeaconselect != null) {
            this.onbeaconselect(paste_string.toLowerCase());
        }
    }

    doGenerate() {
        console.log("generate.");
        if (this.ongenerateselect != null) {
            this.ongenerateselect();
        }
    }

    doScan() {
        console.log("scan.");
        if (this.onscanselect != null) {
            this.onscanselect();
        }
    }

    doForget() {
        console.log("forget.");
        if (this.onforgetselect != null) {
            this.onforgetselect();
        }
    }

    doConnectStored() {
        console.log("connect to stored.");
        if (this.onconnectstoredselect != null) {
            this.onconnectstoredselect();
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        D.textParagraph(flex, this.title_string,
                        "font-black text-xl text-gray-600");
    }

    drawDisconnected(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        D.textParagraph(flex, "(disconnected)",
                        "font-black text-gray-600 py-5");
    }

    drawTitlePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-wrap section-background");
        var button_flex = D.emptyDiv(flex, "flex-initial px-2");
        var title_flex = D.emptyDiv(flex, "flex-initial px-5 py-2");
        this.drawBackButton(button_flex, this.onbackclick);
        this.drawTitle(title_flex);
    }


    connectResult() {
        var paste_string = this.paste_input.value;
        console.log("paste: " + paste_string);
        this.stopScanning();
        if (this.onbeaconselect != null) {
            this.onbeaconselect(paste_string.toLowerCase());
        }
    }


    drawStored(div) {
        var flex = D.emptyDiv(div, "flex flex-col");
        D.textParagraph(flex, this.stored_string,
                        "font-black text-gray-600 py-5");
        if (! this.hasBeacon()) {
            D.textParagraph(flex, "(none)",
                            "font-black text-gray-600 py-5");
            return;
        }
        var beacon = this.getBeacon();
        D.textParagraph(flex, beacon,
                        "font-black break-words text-gray-500 py-5");

        var buttons = D.emptyDiv(flex, "flex justify-around py-4");
        this.drawConnectStoredButton(buttons,
                             (function() {this.doConnectStored()}).bind(this));
        this.drawForgetButton(buttons,
                             (function() {this.doForget()}).bind(this));

    }

    drawInterfacePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-col section-background");

        this.drawDisconnected(flex);

        var paste = D.emptyDiv(flex,
                               "flex justify-center items-center " +
                               "border border-gray-800 py-2 m-2 rounded-2xl");
        this.paste_input = D.emptyInput(paste,
            "w-auto appearance-none rounded shadow " +
            "p-3 text-white bg-gray-700 mr-2 focus:outline-none");
        this.paste_input.setAttribute("placeholder", "Paste Beacon Here");
        this.drawPasteButton(paste,
                             (function() {this.pasteResult()}).bind(this));
        var buttons = D.emptyDiv(flex, "flex justify-around py-4");
        this.drawGenerateButton(buttons,
                             (function() {this.doGenerate()}).bind(this));
        this.drawScanButton(buttons,
                            (function() {this.doScan()}).bind(this));
        this.drawStored(flex);
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
        //this.drawScanVideo(flex_mid);
        this.drawInterfacePanel(flex_mid);
        var flex_bottom = D.emptyDiv(flex, "flex-none");
    }
}


class ConnectWalletScreen extends ConnectScreen {
    constructor(app_div, model) {
        super(app_div, model);
        this.title_string = "Connect Wallet:";
        this.stored_string = "Stored Wallet Beacon:";
    }

    hasBeacon() {
        return this.model.hasStoredConsumerBeacon();
    }

    getBeacon() {
        return this.model.getStoredConsumerBeacon();
    }
}

class ConnectAppScreen extends ConnectScreen {
    constructor(app_div, model) {
        super(app_div, model);
        this.title_string = "Connect App:";
        this.stored_string = "Stored App Beacon:";
    }

    hasBeacon() {
        return this.model.hasStoredProviderBeacon();
    }

    getBeacon() {
        return this.model.getStoredProviderBeacon();
    }
}

exports.ConnectWalletScreen = ConnectWalletScreen;
exports.ConnectAppScreen = ConnectAppScreen;
