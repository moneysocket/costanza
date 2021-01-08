// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php


const Kjua = require('kjua');

const D = require('../utl/dom.js').DomUtl;
const I = require('../utl/icon.js').IconUtl;

const ConnectProgress = require("./connect-progress.js").ConnectProgress;
const Copy = require('clipboard-copy');

class ConnectingScreen {
    constructor(app_div, model) {
        this.app_div = app_div;
        this.model = model;

        this.displayed_beacon = "";
        this.copy_span = null;

        var d = document.createElement("div");
        D.setClass(d, "font-black text-2xl text-yellow-800");
        this.connect_progress = new ConnectProgress(d);

        this.ondisconnectclick = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////

    drawDisconnectButton(div, disconnect_func) {
        var b = D.button(div, disconnect_func, "main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var icon_span = D.emptySpan(flex);
        var back = I.plug2x(icon_span);
        var text = D.textSpan(flex, "Disconnect", "px-1");
    }

    drawCopyBeaconButton(div, copy_func) {
        var b = D.button(div, copy_func, "p-2 main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var icon_span = D.emptySpan(flex);
        var qr = I.copy2x(icon_span);
        this.copy_span = D.textSpan(flex, "Copy", "px-1");
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
                        "font-black text-2xl text-yellow-800");
    }

    drawTitlePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-wrap section-background");
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
            fontcolor: "#941",
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
