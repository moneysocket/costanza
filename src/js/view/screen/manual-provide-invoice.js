// Copyright (c) 2021 Moneysocket Developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const Kjua = require('kjua');

const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;
const Copy = require('clipboard-copy');

const Screen = require('./screen.js').Screen;


class ManualProvideInvoiceScreen extends Screen {
    constructor(app_div, model) {
        super(app_div, model);

        this.onbackclick = null;
        this.displayed_bolt11 = "";
        this.copy_span = null;

        this.title_string = "Pay This:";
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////

    drawCopyBolt11Button(div, copy_func) {
        this.drawButton(div, I.copy2x, "Copy", copy_func, "main-button");
    }

    doCopy() {
        Copy(this.displayed_bolt11);
        console.log("copied: " + this.displayed_bolt11);
        this.copy_span.innerHTML = "Copied!";
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawQr(div, bolt11) {
        this.displayed_bolt11 = bolt11;
        var upper_bolt11 = bolt11.toUpperCase();

        var qr = Kjua({
            ecLevel:   "M",
            render:    "canvas",
            size:      360,
            text:      upper_bolt11,
            label:     "manual bolt11",
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

    drawInterfacePanel(div, bolt11) {
        var flex = D.emptyDiv(div,
                              "flex flex-col section-background");
        var q = D.emptyDiv(flex, "flex justify-center");
        this.drawQr(q, bolt11);
        var buttons = D.emptyDiv(flex, "flex justify-around py-4");
        this.drawCopyBolt11Button(buttons,
                                  (function() {this.doCopy()}).bind(this));
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    draw(bolt11) {
        var flex = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(flex, "flex-none");
        this.drawTitlePanel(flex_top);

        var flex_mid = D.emptyDiv(flex, "flex-grow");
        this.drawInterfacePanel(flex_mid, bolt11);
        var flex_bottom = D.emptyDiv(flex, "flex-none");
    }
}

exports.ManualProvideInvoiceScreen = ManualProvideInvoiceScreen;
