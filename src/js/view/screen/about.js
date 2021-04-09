// Copyright (c) 2021 Moneysocket Developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php


const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;

const Screen = require('./screen.js').Screen;


class AboutScreen extends Screen {
    constructor(app_div) {
        super(app_div);

        this.onbackclick = null;

        this.title_string = "About";
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawInfoPanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-col section-background");
        D.textParagraph(flex, "Costanza Wallet for Moneysocket v0.0.0",
                        "text-subheading");
        D.textParagraph(flex, "Reckless! Use at your own risk!",
                        "text-subheading");
        D.emptyDiv(flex, "h-10");
        D.hyperlinkTabOpen(flex, "Wallet Source",
                           "https://github.com/moneysocket/costanza",
                           "text-link");
        D.hyperlinkTabOpen(flex, "Moneysocket Homepage", "https://socket.money",
                           "text-link");
        D.hyperlinkTabOpen(flex, "Telegram Chat", "https://t.me/moneysocket",
                           "text-link");
        D.hyperlinkTabOpen(flex, "Donate", "https://socket.money/#donate",
                           "text-link");
        D.emptyDiv(flex, "h-10");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    draw() {
        var screen = this.screenDiv();
        var flex_top = D.emptyDiv(screen, "flex-none");
        this.drawTitlePanel(flex_top);

        var flex_mid = D.emptyDiv(screen, "flex-grow");
        this.drawInfoPanel(flex_mid);
        var flex_bottom = D.emptyDiv(screen, "flex-none");
    }
}

exports.AboutScreen = AboutScreen;
