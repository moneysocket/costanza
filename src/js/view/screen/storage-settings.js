// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php


const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;

const PERSIST_PROFILE = require("../../model/persist.js").PERSIST_PROFILE;


class StorageSettingsScreen {
    constructor(app_div, model) {
        this.model = model;
        this.app_div = app_div;
        this.onbackclick = null;
        this.onprofilechange = null;
        this.onclearclick = null;
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

    drawSelectButton(div, select_func) {
        var b = D.button(div, select_func,
                         "bg-yellow-700 hover:bg-yellow-600 text-white " +
                         "font-bold rounded py-1 px-5");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        D.textSpan(flex, "Use");
    }

    drawClearButton(div, clear_func) {
        var b = D.button(div, clear_func,
                         "bg-yellow-700 hover:bg-yellow-600 text-white " +
                         "font-bold rounded py-1 px-5");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        D.textSpan(flex, "Clear");
    }


    doSelect(profile) {
        if (this.onprofilechange != null) {
            this.onprofilechange(profile);
        }
    }

    doClear(profile) {
        if (this.onclearclick != null) {
            this.onclearclick(profile);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        D.textParagraph(flex, "Storage Settings:",
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

    drawInfoPanel(div) {
        var [profile, checkout_record] = this.model.getStorageSettings();
        var flex = D.emptyDiv(div,
                              "flex flex-col section-background");

        D.textParagraph(flex, "Currently Using:", "text-yellow-900");
        var p;
        switch(profile) {
        case PERSIST_PROFILE.ONE:
            p = "Profile 1"
            break;
        case PERSIST_PROFILE.TWO:
            p = "Profile 2"
            break;
        case PERSIST_PROFILE.THREE:
            p = "Profile 3"
            break;
        }
        D.textParagraph(flex, p, "font-bold text-yellow-900");

        var profile1 = D.emptyDiv(flex, "flex justify-around items-center " +
                                "bg-yellow-500 py-1 m-2 rounded");
        D.textSpan(profile1, "Profile 1 In Use: ", "text-yellow-900");
        D.textSpan(profile1,
                   checkout_record[PERSIST_PROFILE.ONE] ? "True" : "False",
                   "px-8 text-2xl font-bold text-yellow-900");
        this.drawSelectButton(profile1,
                              (function() {
            this.doSelect(PERSIST_PROFILE.ONE)}).bind(this));
        this.drawClearButton(profile1,
                              (function() {
            this.doClear(PERSIST_PROFILE.ONE)}).bind(this));

        var profile2 = D.emptyDiv(flex, "flex justify-around items-center " +
                                "bg-yellow-500 py-1 m-2 rounded");
        D.textSpan(profile2, "Profile 2 In Use: ", "text-yellow-900");
        D.textSpan(profile2,
                   checkout_record[PERSIST_PROFILE.TWO] ? "True" : "False",
                   "px-8 text-2xl font-bold text-yellow-900");
        this.drawSelectButton(profile2,
                              (function() {
            this.doSelect(PERSIST_PROFILE.TWO)}).bind(this));
        this.drawClearButton(profile2,
                             (function() {
            this.doClear(PERSIST_PROFILE.TWO)}).bind(this));

        var profile3 = D.emptyDiv(flex, "flex justify-around items-center " +
                                "bg-yellow-500 py-1 m-2 rounded");
        D.textSpan(profile3, "Profile 3 In Use: ", "text-yellow-900");
        D.textSpan(profile3,
                   checkout_record[PERSIST_PROFILE.THREE] ? "True" : "False",
                   "px-8 text-2xl font-bold text-yellow-900");
        this.drawSelectButton(profile3,
                              (function() {
            this.doSelect(PERSIST_PROFILE.THREE)}).bind(this));
        this.drawClearButton(profile3,
                              (function() {
            this.doClear(PERSIST_PROFILE.THREE)}).bind(this));
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    draw() {
        var flex = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(flex, "flex-none");
        this.drawTitlePanel(flex_top);

        var flex_mid = D.emptyDiv(flex, "flex-grow");
        this.drawInfoPanel(flex_mid);
        var flex_bottom = D.emptyDiv(flex, "flex-none");
    }
}

exports.StorageSettingsScreen = StorageSettingsScreen;
