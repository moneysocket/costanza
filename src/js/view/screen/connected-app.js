// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;

const Wad = require("moneysocket").Wad;

class ConnectedAppScreen {
    constructor(app_div, model) {
        this.app_div = app_div;
        this.onbackclick = null;
        this.ondisconnectclick = null;
        this.oninputerror = null;
        this.onwadchange = null;
        this.onpayerchange = null;
        this.onpayeechange = null;
        this.model = model;
        this.balance_div = null;
        this.available_div = null;
        this.send_div = null;
        this.receive_div = null;

        this.set_input = null;
        this.slider_val = 0;
        this.slider_input = null;
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
        var text = D.textSpan(flex, "Disconnect App");
    }

    drawSetButton(div, set_func) {
        var b = D.button(div, set_func, "p-2 main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        D.textSpan(flex, "Set");
    }

    drawToggleButton(div, toggle_func) {
        var b = D.button(div, toggle_func,
                         "bg-gray-700 hover:bg-gray-900 text-gray-300 " +
                         "font-bold rounded py-1 px-5");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        D.textSpan(flex, "Toggle");
    }

    drawPercentButton(div, pct, pct_func) {
        var b = D.button(div, pct_func,
                         "bg-gray-700 hover:bg-gray-900 text-gray-300 " +
                         "font-bold rounded py-3 px-5");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        D.textSpan(flex, pct.toString() + "%");
    }

    ///////////////////////////////////////////////////////////////////////////
    // input actions
    ///////////////////////////////////////////////////////////////////////////

    setResult() {
        var set_string = this.set_input.value;
        var set_units = parseFloat(set_string);
        if (isNaN(set_units)) {
            if (this.oninputerror != null) {
                this.oninputerror("must be a numeric value");
            }
            return;
        }
        if (set_units < 0) {
            if (this.oninputerror != null) {
                this.oninputerror("must be positive value");
            }
            return;
        }

        var wad = this.model.getConsumerBalanceWad();
        var ratio;
        var new_msats;
        if (wad.asset_stable) {
            ratio = set_units / wad.asset_units;
        } else {
            var sats = wad.msats / 1000.0;
            ratio = set_units / sats;
        }
        if (ratio > 1.0) {
            ratio = 1.0;
        }
        var new_msats = Math.round(wad.msats * ratio);
        var new_wad = Wad.clone_msats(wad, new_msats);
        console.log("new wad: " + new_wad.toString());
        if (this.onwadchange != null) {
            this.onwadchange(new_wad);
        }
    }

    sliderInput() {
        var i = this.slider_input.firstChild;
        this.slider_val = i.value;
        //console.log("slider input: " + this.slider_val);
        this.updateInput(this.slider_val);
    }

    doDisconnect() {
        if (this.ondisconnectclick != null) {
            this.ondisconnectclick();
        }
    }

    updateInput(pct) {
        var wad = this.model.getConsumerBalanceWad();
        var input_value;
        if (wad.asset_stable) {
            input_value = (wad.asset_units * (pct / 100)).toFixed(3);
        } else {
            var sats = wad.msats / 1000.0
            input_value = (sats * (pct / 100)).toFixed(3);
        }
        this.set_input.value = input_value;
        var i = this.slider_input.firstChild;
        i.value = pct;
    }

    doPercent(pct) {
        this.updateInput(pct);
    }

    doSendToggle() {
        console.log("send toggle");
        var new_payer = ! this.model.getProviderIsPayer();
        if (this.onpayerchange != null) {
            this.onpayerchange(new_payer);
        }
    }

    doReceiveToggle() {
        console.log("receive toggle");
        var new_payee = ! this.model.getProviderIsPayee();
        if (this.onpayeechange != null) {
            this.onpayeechange(new_payee);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Rows
    ///////////////////////////////////////////////////////////////////////////

    drawBalanceRow(div) {
        var wad = this.model.getProviderBalanceWad();
        D.deleteChildren(div);

        var flex = D.emptyDiv(div, "flex flex-col py-2");
        D.textParagraph(flex, "Authorized:", "text-gray-500");
        D.textParagraph(flex, wad.toString(),
                        "font-bold text-3xl ms-green-txt ");
        var sats = (wad['msats'] / 1000.0).toFixed(3) + " sats";
        var hoverstring = wad['name'] + "\n" + sats;
        div.setAttribute("title", hoverstring);
    }

    drawInputRow(div) {
        var set = D.emptyDiv(div, "flex justify-center items-center " +
                                  "bg-gray-800 py-2 m-2 rounded");
        this.set_input = D.emptyInput(set,
            "w-40 appearance-none rounded shadow " +
            "p-3 bg-gray-700 text-gray-300 mr-2 focus:outline-none");
        this.set_input.setAttribute("type", "number");
        this.set_input.setAttribute("min", "0");
        this.set_input.setAttribute("placeholder", "amount");
        this.drawSetButton(set, (function() {this.setResult()}).bind(this));
    }

    drawSliderRow(div) {
        this.slider_input = D.emptyDiv(div, "py-2");
        var i = document.createElement("input");
        i.setAttribute("type", "range");
        i.setAttribute("min", "0");
        i.setAttribute("max", "100");
        i.setAttribute("value", this.slider_val.toString());
        i.setAttribute("class", "slider");
        i.oninput = (function () {
            this.sliderInput();
        }.bind(this));
        this.slider_input.appendChild(i);
    }

    drawPercentButtonRow(div) {
        var flex = D.emptyDiv(div, "flex justify-around py-2");
        this.drawPercentButton(flex, 0,
                               (function() {this.doPercent(0)}).bind(this));
        this.drawPercentButton(flex, 25,
                               (function() {this.doPercent(25)}).bind(this));
        this.drawPercentButton(flex, 50,
                               (function() {this.doPercent(50)}).bind(this));
        this.drawPercentButton(flex, 75,
                               (function() {this.doPercent(75)}).bind(this));
        this.drawPercentButton(flex, 100,
                               (function() {this.doPercent(100)}).bind(this));

    }

    drawSendToggleRow(div) {
        D.deleteChildren(div);
        var toggle = D.emptyDiv(div, "flex justify-center items-center " +
                                "bg-gray-800 py-1 m-2 rounded");
        D.textSpan(toggle, "Authorize Send:", "text-gray-500");
        var payer = this.model.getProviderIsPayer();
        D.textSpan(toggle, payer ? "True" : "False",
                   "px-8 text-2xl font-bold text-gray-500");
        if (! this.model.getConsumerIsPayer()) {
            return;
        }
        this.drawToggleButton(toggle,
                              (function() {this.doSendToggle()}).bind(this))
    }

    drawReceiveToggleRow(div) {
        D.deleteChildren(div);
        var toggle = D.emptyDiv(div, "flex justify-center items-center " +
                                "bg-gray-800 py-1 m-2 rounded");
        D.textSpan(toggle, "Authorize Receive:", "text-gray-500");
        var payee = this.model.getProviderIsPayee();
        D.textSpan(toggle, payee ? "True" : "False",
                   "px-8 text-2xl font-bold text-gray-500");
        if (! this.model.getConsumerIsPayee()) {
            return;
        }
        this.drawToggleButton(toggle,
                              (function() {this.doReceiveToggle()}).bind(this))
    }

    drawAvailableRow(div) {
        var wad = this.model.getConsumerBalanceWad();
        var payer = this.model.getConsumerIsPayer();
        var payee = this.model.getConsumerIsPayee();

        D.deleteChildren(div);
        var across = D.emptyDiv(div, "flex justify-around py-4 bg-gray-800");
        var col1 = D.emptyDiv(across, "flex flex-col");
        D.textSpan(col1, "Available:", "text-gray-500");
        D.textSpan(col1, wad.toString(), "font-bold text-xl text-gray-500");
        var col2 = D.emptyDiv(across, "flex flex-col items-center");
        var r1 = D.emptyDiv(col2, "flex justify-center");
        D.textSpan(r1, "Can Send:", "text-gray-500");
        D.textSpan(r1, payer ? "True" : "False",
                   "font-bold text-xl text-gray-500 px-2");
        var r2 = D.emptyDiv(col2, "flex justify-center items-center");
        D.textSpan(r2, "Can Receive:", "text-gray-500");
        D.textSpan(r2, payee ? "True" : "False",
                   "font-bold text-xl text-gray-500 px-2");
    }

    drawDisconnectRow(div) {
        var buttons = D.emptyDiv(div, "flex justify-around py-4");
        this.drawDisconnectButton(buttons,
                             (function() {this.doDisconnect()}).bind(this));
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        D.textParagraph(flex, "App Connection:",
                        "font-black text-gray-400");
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
        this.balance_div = D.emptyDiv(flex);
        this.drawBalanceRow(this.balance_div);
        this.drawInputRow(flex);

        this.drawSliderRow(flex);
        this.drawPercentButtonRow(flex);
        this.send_div = D.emptyDiv(flex);
        this.drawSendToggleRow(this.send_div);
        this.receive_div = D.emptyDiv(flex);
        this.drawReceiveToggleRow(this.receive_div);

        this.available_div = D.emptyDiv(flex);
        this.drawAvailableRow(this.available_div);

        this.drawDisconnectRow(flex);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    redrawInfo() {
        console.log("redraw");
        if (this.balance_div != null) {
            this.drawBalanceRow(this.balance_div);
        }
        if (this.available_div != null) {
            this.drawAvailableRow(this.available_div);
        }
        if (this.send_div != null) {
            this.drawSendToggleRow(this.send_div);
        }
        if (this.receive_div != null) {
            this.drawReceiveToggleRow(this.receive_div);
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

exports.ConnectedAppScreen = ConnectedAppScreen;
