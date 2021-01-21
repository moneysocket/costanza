// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const Kjua = require('kjua');

const D = require('../utl/dom.js').DomUtl;
const I = require('../utl/icon.js').IconUtl;
const Copy = require('clipboard-copy');


class ManualProvideInvoiceScreen {
    constructor(app_div, model) {
        this.app_div = app_div;
        this.model = model;
        this.onbackclick = null;
        this.displayed_bolt11 = "";
        this.copy_span = null;
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


    drawCopyBolt11Button(div, copy_func) {
        var b = D.button(div, copy_func, "p-2 main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var icon_span = D.emptySpan(flex);
        var qr = I.copy2x(icon_span);
        this.copy_span = D.textSpan(flex, "Copy", "px-1");
    }

    doCopy() {
        Copy(this.displayed_bolt11);
        console.log("copied: " + this.displayed_bolt11);
        this.copy_span.innerHTML = "Copied!";
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        D.textParagraph(flex, "Pay This:",
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
            fontcolor: "#941",
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
