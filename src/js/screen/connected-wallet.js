// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php


const D = require('../utl/dom.js').DomUtl;
const I = require('../utl/icon.js').IconUtl;


class ConnectedWalletScreen {
    constructor(app_div, model) {
        this.app_div = app_div;
        this.onbackclick = null;
        this.ondisconnectclick = null;
        this.model = model;
        this.balance_div = null;
        this.ping_div = null;
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

    drawDisconnectButton(div, disconnect_func) {
        var b = D.button(div, disconnect_func, "main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var icon_span = D.emptySpan(flex, "px-2");
        var back = I.plug2x(icon_span);
        var text = D.textSpan(flex, "Disconnect");
    }


    doDisconnect() {
        if (this.ondisconnectclick != null) {
            this.ondisconnectclick();
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    // Items
    ///////////////////////////////////////////////////////////////////////////

    drawBalance() {
        var wad = this.model.getConsumerBalanceWad();
        D.deleteChildren(this.balance_div);
        D.textParagraph(this.balance_div, wad.toString(),
                        "font-bold text-3xl text-yellow-900 ");
        var sats = (wad['msats'] / 1000.0).toFixed(3) + " sats";
        var hoverstring = wad['name'] + "\n" + sats;
        this.balance_div.setAttribute("title", hoverstring);
    }

    drawPing() {
        var msecs = this.model.getConsumerLastPing();
        D.deleteChildren(this.ping_div);
        D.textParagraph(this.ping_div, msecs.toString() + " ms", "text-sm");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        D.textParagraph(flex, "Wallet Disconnect:",
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

    drawInterfacePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-col section-background");
        this.balance_div = D.emptyDiv(flex);
        this.drawBalance();
        this.ping_div = D.emptyDiv(flex);
        this.drawPing();

        var buttons = D.emptyDiv(flex, "flex justify-around py-4");
        this.drawDisconnectButton(buttons,
                             (function() {this.doDisconnect()}).bind(this));
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    redrawInfo() {
        if (this.balance_div != null) {
            this.drawBalance();
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
