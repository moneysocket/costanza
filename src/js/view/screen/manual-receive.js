// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;

const Screen = require('./screen.js').Screen;

const MSATS_PER_SAT = 1000.0;
const SATS_PER_BTC = 100000000.0;
const MSATS_PER_BTC = SATS_PER_BTC * MSATS_PER_SAT;

class ManualReceiveScreen extends Screen {
    constructor(app_div, model) {
        super(app_div, model);

        this.onbackclick = null;
        this.oninputerror = null;
        this.oninvoicerequest = null;

        this.val_input = null;

        this.title_string = "Manual Invoice:";
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////

    drawRequestButton(div, set_func) {
        this.drawButtonPlain(div, "Request Invoice", set_func, "main-button");
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
                                  "bg-gray-800 py-2 m-2 rounded");
        var val = D.emptyDiv(background, "flex flex-col");

        var input_div = D.emptyDiv(val, "flex justify-center items-center");
        var symb = D.textSpan(input_div, wad['symbol'],
                              "px-2 font-black text-gray-300");
        this.val_input = D.emptyInput(input_div, "input-area");
        this.val_input.setAttribute("type", "number");
        this.val_input.setAttribute("min", "0");
        this.val_input.setAttribute("placeholder", "value");
        this.val_input.value = 1.0;

        var code = wad.asset_stable ? wad['code'] : "sats";
        var curr = D.textSpan(input_div, code, "font-black text-gray-300");

        var button_div = D.emptyDiv(val, "flex justify-center py-2");
        this.drawRequestButton(button_div,
                               (function() {this.doRequest()}).bind(this));
    }

    drawAvailableRow(div) {
        var wad = this.model.getConsumerBalanceWad();
        var payer = this.model.getConsumerIsPayer();
        var payee = this.model.getConsumerIsPayee();

        D.deleteChildren(div);
        var across = D.emptyDiv(div, "flex justify-around py-4 bg-gray-800");
        var col1 = D.emptyDiv(across, "flex flex-col");
        D.textSpan(col1, "Available:", "text-gray-300");
        D.textSpan(col1, wad.toString(), "font-bold text-xl ms-green-txt");
        var col2 = D.emptyDiv(across, "flex flex-col items-center");
        var r1 = D.emptyDiv(col2, "flex justify-center");
        D.textSpan(r1, "Can Send:", "text-gray-300");
        D.textSpan(r1, payer ? "True" : "False",
                   "font-bold text-xl text-gray-300 px-2");
        var r2 = D.emptyDiv(col2, "flex justify-center items-center");
        D.textSpan(r2, "Can Receive:", "text-gray-300");
        D.textSpan(r2, payee ? "True" : "False",
                   "font-bold text-xl text-gray-300 px-2");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

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
