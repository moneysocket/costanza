// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php


const Kjua = require('kjua');

const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;

var Screen = require('./Screen');

const ConnectProgress = require("./connect-progress.js").ConnectProgress;
const Copy = require('clipboard-copy');

class ConnectingScreen extends Screen {
    constructor(app_div, model) {
        super(app_div, model);

        this.displayed_beacon = "";
        this.copy_span = null;

        var d = document.createElement("div");
        D.setClass(d, "font-black text-2xl text-gray-600");
        this.connect_progress = new ConnectProgress(d);

        this.ondisconnectclick = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////

    drawDisconnectButton(div, disconnect_func) {
        this.drawButton(div, I.plug2x, "Disconnect", disconnect_func, "main-button");
    }

    drawCopyBeaconButton(div, copy_func) {
        this.drawButton(div, I.plug2x, "Copy", copy_func, "main-button");
    }


    doDisconnect() {
        if (this.ondisconnectclick != null) {
            this.ondisconnectclick();
        }
    }

    doCopy() {
        Copy(this.displayed_beacon);
        console.log("copied: " + this.displayed_beacon);
        this.copy_span.innerHTML = "Copied!";
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        D.textParagraph(flex, this.title_string,
                        "font-black text-3xl text-gray-600");
    }

    drawTitlePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-wrap section-background justify-center");
        var button_flex = D.emptyDiv(flex, "flex-initial px-2");
        var title_flex = D.emptyDiv(flex, "flex-initial px-5 py-2");
        this.drawTitle(title_flex);
    }

    drawQr(div) {
        var beacon = this.getBeacon()
        this.displayed_beacon = beacon;
        beacon = beacon.toUpperCase();

        var qr = Kjua({
            ecLevel:   "M",
            render:    "canvas",
            size:      360,
            text:      beacon,
            label:     this.qr_string,
            mode:      "label",
            mSize:     6,
            fontname:  "sans",
            fontcolor: "#3B5323",
            quiet:     0,
        });
        var b = D.emptyDiv(div, "border-8 border-white");
        b.onclick = (function() {this.doCopy()}).bind(this);
        b.appendChild(qr);
    }


    drawInterfacePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-col section-background");
        var q = D.emptyDiv(flex, "flex justify-center");
        this.drawQr(q);

        var p = D.emptyDiv(flex, "py-4");
        p.appendChild(this.connect_progress.parent_div);
        this.connect_progress.draw("DISCONNECTED");

        var buttons = D.emptyDiv(flex, "flex justify-around py-4");
        this.drawDisconnectButton(buttons,
                             (function() {this.doDisconnect()}).bind(this));
        this.drawCopyBeaconButton(buttons,
                            (function() {this.doCopy()}).bind(this));
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    postConnectEvent(layer_name, event) {
       this.connect_progress.drawStackEvent(layer_name, event);
    }

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

class ConnectingWalletScreen extends ConnectingScreen {
    constructor(app_div, model) {
        super(app_div, model);
        this.title_string = "Connecting To Wallet:";
        this.qr_string = "Wallet Provider";
    }

    getBeacon() {
        return this.model.getEphemeralConsumerBeacon();
    }
}

class ConnectingAppScreen extends ConnectingScreen {
    constructor(app_div, model) {
        super(app_div, model);
        this.title_string = "Connecting To App:";
        this.qr_string = "App Consumer";
    }

    getBeacon() {
        return this.model.getEphemeralProviderBeacon();
    }
}

exports.ConnectingAppScreen = ConnectingAppScreen;
exports.ConnectingWalletScreen = ConnectingWalletScreen;
