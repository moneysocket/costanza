// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php


const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;

const Screen = require('./screen.js').Screen;


class ConnectedWalletScreen extends Screen {
    constructor(app_div, model) {
        super(app_div, model);

        this.onbackclick = null;
        this.ondisconnectclick = null;
        this.onmanualsendclick = null;
        this.onmanualreceiveclick = null;
        this.model = model;
        this.balance_div = null;
        this.payer_div = null;
        this.payee_div = null;
        this.ping_div = null;

        this.title_string = "Wallet Disconnect";
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////

    drawDisconnectButton(div, disconnect_func) {
        this.drawButton(div, I.plug2x, "Disconnect", disconnect_func, "main-button");
    }

    drawSendButton(div, send_func) {
        this.drawButton(div, I.qrcode2x, "Manual Send", send_func, "main-button");
    }

    drawReceiveButton(div, recv_func) {
        this.drawButton(div, I.qrcode2x, "Manual Receive", recv_func, "main-button");
    }

    doDisconnect() {
        if (this.ondisconnectclick != null) {
            this.ondisconnectclick();
        }
    }

    doSend() {
        if (this.onmanualsendclick != null) {
            this.onmanualsendclick();
        }
    }

    doReceive() {
        if (this.onmanualreceiveclick != null) {
            this.onmanualreceiveclick();
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    // Items
    ///////////////////////////////////////////////////////////////////////////

    drawBalance() {
        var wad = this.model.getConsumerBalanceWad();
        D.deleteChildren(this.balance_div);
        D.textParagraph(this.balance_div, wad.toString(),
                        "font-bold text-3xl ms-green-txt ");
        var sats = (wad['msats'] / 1000.0).toFixed(3) + " sats";
        var hoverstring = wad['name'] + "\n" + sats;
        this.balance_div.setAttribute("title", hoverstring);
    }

    drawPayer() {
        var is_payer = this.model.getConsumerIsPayer();
        D.deleteChildren(this.payer_div);
        D.textSpan(this.payer_div, "Is Payer: ", "text-sm text-gray-300");
        D.textSpan(this.payer_div, is_payer ? "True" : "False",
                   "font-bold text-sm text-gray-300");
    }

    drawPayee() {
        var is_payee = this.model.getConsumerIsPayee();
        D.deleteChildren(this.payee_div);
        D.textSpan(this.payee_div, "Is Payee: ", "text-sm text-gray-300");
        D.textSpan(this.payee_div, is_payee ? "True" : "False",
                   "font-bold text-sm text-gray-300");
    }

    drawPing() {
        var msecs = this.model.getConsumerLastPing();
        D.deleteChildren(this.ping_div);
        D.textParagraph(this.ping_div, msecs.toString() + " ms", "text-sm text-gray-300");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawInterfacePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-col section-background");
        this.balance_div = D.emptyDiv(flex);
        this.drawBalance();
        this.payer_div = D.emptyDiv(flex);
        this.drawPayer();
        this.payee_div = D.emptyDiv(flex);
        this.drawPayee();
        this.ping_div = D.emptyDiv(flex);
        this.drawPing();

        var buttons = D.emptyDiv(flex, "flex justify-around py-4");
        this.drawDisconnectButton(buttons,
                                 (function() {this.doDisconnect()}).bind(this));
        var send = D.emptyDiv(flex, "flex justify-around py-4");
        this.drawSendButton(send, (function() {this.doSend()}).bind(this));
        var recv = D.emptyDiv(flex, "flex justify-around py-4");
        this.drawReceiveButton(recv,
                               (function() {this.doReceive()}).bind(this));
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    redrawInfo() {
        if (this.balance_div != null) {
            this.drawBalance();
        }
        if (this.payer_div != null) {
            this.drawPayer();
        }
        if (this.payee_div != null) {
            this.drawPayee();
        }
        if (this.ping_div != null) {
            this.drawPing();
        }
    }

    draw() {
        var flex = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(flex, "flex-none");
        this.drawTitlePanel(flex_top);

        var flex_mid = D.emptyDiv(flex, "flex-grow");
        this.drawInterfacePanel(flex_mid);
        var flex_bottom = D.emptyDiv(flex, "flex-none");
    }
}

exports.ConnectedWalletScreen = ConnectedWalletScreen;
