// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var D = require('../../utl/dom.js').DomUtl;
var I = require('../../utl/icon.js').IconUtl;

const Screen = require('./screen.js').Screen;


class MenuScreen extends Screen {
    constructor(app_div) {
        super(app_div);

        this.onbackclick = null;

        this.onwalletproviderclick = null;
        this.onappconsumerclick = null;
        this.onbolt11receiveclick = null;
        this.onstoragesettingsclick = null;
        this.onstoragesettingsclick = null;
        this.onaboutclick = null;

        this.title_string = "Menu";
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawEntryPanel(div) {
        var flex = D.emptyDiv(div,
                              "flex-col justify-evenly section-background");
        this.drawMenuPanelEntry(flex, this.onwalletproviderclick, I.cog1x, "Wallet Provider Connection");
        this.drawMenuPanelEntry(flex, this.onappconsumerclick, I.cog1x, "App Consumer Connection");
        this.drawMenuPanelEntry(flex, this.onbolt11receiveclick, I.bolt, "Create Bolt11 To Receive");
        this.drawMenuPanelEntry(flex, this.onstoragesettingsclick, I.floppy, "Storage Settings");
        this.drawMenuPanelEntry(flex, this.onaboutclick, I.qcircle, "About");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    draw() {
        var flex = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(flex, "flex-none");
        this.drawTitlePanel(flex_top);
        this.drawEntryPanel(flex_top);
    }
}

exports.MenuScreen = MenuScreen;
