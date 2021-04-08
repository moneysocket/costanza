// Copyright (c) 2021 Moneysocket Developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php


const Kjua = require('kjua');

const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;

const Screen = require('./screen.js').Screen;

const ConnectProgress = require("./connect-progress.js").ConnectProgress;
const Copy = require('clipboard-copy');

class ConnectingScreen extends Screen {
    constructor(app_div, model) {
        super(app_div, model);

        this.displayed_beacon = "";
        this.copy_span = null;

        var d = document.createElement("div");
        D.setClass(d, "font-black text-2xl text-gray-300");
        this.connect_progress = new ConnectProgress(d);

        this.ondisconnectclick = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////

    drawDisconnectButton(div, disconnect_func) {
        this.drawButton(div, I.plug2x, "Disconnect", disconnect_func,
                        "main-button");
    }

    drawCopyBeaconButton(div, copy_func) {
        var b = this.drawButton(div, I.plug2x, "Copy", copy_func,
                                "main-button");
        this.copy_span = b.inner_text_span;
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

    drawQr(div) {
        var beacon = this.getBeacon()
        this.displayed_beacon = beacon;
        beacon = beacon.toUpperCase();

        var qr = Kjua({
            ecLevel:   "M",
            render:    "canvas",
            size:      320,
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
        var flex = this.screenDiv();
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
