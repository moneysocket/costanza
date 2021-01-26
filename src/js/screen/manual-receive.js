// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const D = require('../utl/dom.js').DomUtl;
const I = require('../utl/icon.js').IconUtl;

const MSATS_PER_SAT = 1000.0;
const SATS_PER_BTC = 100000000.0;
const MSATS_PER_BTC = SATS_PER_BTC * MSATS_PER_SAT;

class ManualReceiveScreen {
    constructor(app_div, model) {
        this.app_div = app_div;
        this.model = model;
        this.onbackclick = null;
        this.oninputerror = null;
        this.oninvoicerequest = null;

        this.val_input = null;
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

    drawRequestButton(div, set_func) {
        var b = D.button(div, set_func, "p-2 main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        D.textSpan(flex, "Request Invoice");
    }

    ///////////////////////////////////////////////////////////////////////////
    // do request
    ///////////////////////////////////////////////////////////////////////////

    doRequest() {
        var val_string = this.val_input.value;
        var val_units = parseFloat(val_string);
        if (isNaN(val_units)) {
            if (this.oninputerror != null) {
                this.oninputerror("must be a numeric value");
            }
            return;
        }
        if (val_units < 0) {
            if (this.oninputerror != null) {
                this.oninputerror("must be positive value");
            }
            return;
        }
        var payee = this.model.getConsumerIsPayee();
        if (! payee) {
            if (this.oninputerror != null) {
                this.oninputerror("wallet provider can't receive");
            }
            return;
        }

        var wad = this.model.getConsumerBalanceWad();
        var rate = wad.getDefactoRate();
        var msats;
        if (wad['asset_stable']) {
            var [amount, code] = rate.convert(val_units, wad['code']);
            console.assert(code == "BTC");
            msats = Math.round(amount * MSATS_PER_BTC);
        } else {
            msats = Math.round(val_units * 1000.0);
        }
        if (this.oninvoicerequest != null) {
            this.oninvoicerequest(msats);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // input actions
    ///////////////////////////////////////////////////////////////////////////

    drawInputRow(div) {
        var wad = this.model.getConsumerBalanceWad();
        var background = D.emptyDiv(div, "flex justify-center items-center " +
                                  "bg-yellow-500 py-2 m-2 rounded");
        var val = D.emptyDiv(background, "flex flex-col");

        var input_div = D.emptyDiv(val, "flex justify-center items-center");
        var symb = D.textSpan(input_div, wad['symbol'],
                              "px-2 font-black text-yellow-800");
        this.val_input = D.emptyInput(input_div,
            "w-40 appearance-none rounded shadow " +
            "p-3 text-grey-dark mr-2 focus:outline-none");
        this.val_input.setAttribute("type", "number");
        this.val_input.setAttribute("min", "0");
        this.val_input.setAttribute("placeholder", "value");
        this.val_input.value = 1.0;

        var code = wad.asset_stable ? wad['code'] : "sats";
        var curr = D.textSpan(input_div, code, "font-black text-yellow-800");

        var button_div = D.emptyDiv(val, "flex justify-center py-2");
        this.drawRequestButton(button_div,
                               (function() {this.doRequest()}).bind(this));
    }

    drawAvailableRow(div) {
        var wad = this.model.getConsumerBalanceWad();
        var payer = this.model.getConsumerIsPayer();
        var payee = this.model.getConsumerIsPayee();

        D.deleteChildren(div);
        var across = D.emptyDiv(div, "flex justify-around py-4 bg-yellow-500");
        var col1 = D.emptyDiv(across, "flex flex-col");
        D.textSpan(col1, "Available:", "text-yellow-900");
        D.textSpan(col1, wad.toString(), "font-bold text-xl text-yellow-900");
        var col2 = D.emptyDiv(across, "flex flex-col items-center");
        var r1 = D.emptyDiv(col2, "flex justify-center");
        D.textSpan(r1, "Can Send:", "text-yellow-900");
        D.textSpan(r1, payer ? "True" : "False",
                   "font-bold text-xl text-yellow-900 px-2");
        var r2 = D.emptyDiv(col2, "flex justify-center items-center");
        D.textSpan(r2, "Can Receive:", "text-yellow-900");
        D.textSpan(r2, payee ? "True" : "False",
                   "font-bold text-xl text-yellow-900 px-2");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        D.textParagraph(flex, "Manual Invoice:",
                        "font-black text-yellow-800");
    }

    drawTitlePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-wrap section-background");
        var button_flex = D.emptyDiv(flex, "flex-initial px-2");
        var title_flex = D.emptyDiv(flex, "flex-initial px-5 py-2");
        this.drawBackButton(button_flex, this.onbackclick);
        this.drawTitle(title_flex);
    }

    drawInterfacePanel(div) {
        var flex = D.emptyDiv(div, "flex flex-col section-background");
        this.drawInputRow(flex);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    draw() {
        var flex = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(flex, "flex-none");
        this.drawTitlePanel(flex_top);

        var flex_mid = D.emptyDiv(flex, "flex-grow");
        this.drawAvailableRow(flex_mid);
        this.drawInterfacePanel(flex_mid);
        var flex_bottom = D.emptyDiv(flex, "flex-none");
    }
}

exports.ManualReceiveScreen = ManualReceiveScreen;