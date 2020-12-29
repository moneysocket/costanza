// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php


const Kjua = require('kjua');

var D = require('../utl/dom.js').DomUtl;
var I = require('../utl/icon.js').IconUtl;


class ConnectingWalletScreen {
    constructor(app_div, model) {
        this.app_div = app_div;
        this.model = model;
        this.ondisconnectclick = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////

    drawDisconnectButton(div, disconnect_func) {
        var b = D.button(div, disconnect_func, "main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var icon_span = D.emptySpan(flex, "px-2");
        var back = I.plug2x(icon_span);
        var text = D.textSpan(flex, "Disconnect");
    }

    drawCopyBeaconButton(div, copy_func) {
        var b = D.button(div, copy_func, "p-2 main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var icon_span = D.emptySpan(flex, "px-2");
        var qr = I.copy2x(icon_span);
        var text = D.textSpan(flex, "Copy Beacon");
    }


    doDisconnect() {
        console.log("disconnect");
        if (this.ondisconnectclick != null) {
            this.ondisconnectclick();
        }
    }

    doCopy() {
        console.log("copy");
    }

    drawTapQr(div, copy_func) {
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        D.textParagraph(flex, "Connecting To Wallet:",
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
        var beacon = this.model.getEphemeralConsumerBeacon();
        beacon = beacon.toUpperCase();

        var qr = Kjua({
            ecLevel: "M",
            render:  "canvas",
            size:    360,
            text:    beacon,
            label:   "beacon",
            mode:      "label",
            mSize:     10,
            fontname:  "sans",
            fontcolor: "#f00",
            quiet:   0,
        });
        var b = D.emptyDiv(div, "border-8 border-white");
        b.appendChild(qr);
    }


    drawInterfacePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-col section-background");
        var q = D.emptyDiv(flex, "flex justify-center");
        this.drawQr(q);

        var buttons = D.emptyDiv(flex, "flex justify-around py-4");
        this.drawDisconnectButton(buttons,
                             (function() {this.doDisconnect()}).bind(this));
        this.drawCopyBeaconButton(buttons,
                            (function() {this.doCopy()}).bind(this));
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

exports.ConnectingWalletScreen = ConnectingWalletScreen;
