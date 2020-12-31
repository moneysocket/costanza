// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php


const D = require('../utl/dom.js').DomUtl;
const I = require('../utl/icon.js').IconUtl;


class ConnectedWalletScreen {
    constructor(app_div) {
        this.app_div = app_div;
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


    doDisconnect() {
        if (this.ondisconnectclick != null) {
            this.ondisconnectclick();
        }
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
        this.drawTitle(title_flex);
    }

    drawInterfacePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-col section-background");

        var buttons = D.emptyDiv(flex, "flex justify-around py-4");
        this.drawDisconnectButton(buttons,
                             (function() {this.doDisconnect()}).bind(this));
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

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
