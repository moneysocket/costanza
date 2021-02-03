// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const D = require('../../utl/dom.js').DomUtl;

const CROSS_MARK = "❌";
const MONEY_WING = "💸";
const CHECK_MARK = "✅";
const EGGPLANT = "🍆";

const LIGHT_BULB = "💡";
const PLUG = "🔌";

const COMPLETE = CHECK_MARK;
const INCOMPLETE = CROSS_MARK;

const GOOD = LIGHT_BULB;
const BAD = PLUG;



class ConnectProgress {
    constructor(div) {
        this.parent_div = div;
        this.div = D.emptyDiv(this.parent_div);
        this.last_state = "INIT";

    }

    setConnectingTitle(div, title, color) {
        var t = D.textSpan(div, title, "");
    }

    setProgressLine(div, progress_string) {
        var t = D.textSpan(div, progress_string, "");
    }

    draw(state) {
        console.log("stack progress: " + state);
        switch (state) {
        case "DISCONNECTED":
            var title = "Disconnected";
            var color = "black";
            var line = BAD + BAD + BAD + BAD + "   " + BAD;
            break;
        case "CONNECTING_WEBSOCKET":
            var title = "Connecting Websocket";
            var color = "orange";
            var line = BAD + BAD + BAD + BAD + "   " + BAD;
            break;
        case "REQUESTING_RENDEZVOUS":
            var title = "Requesting Rendezvous";
            var color = "orange";
            var line = GOOD + BAD + BAD + BAD + "   " + BAD;
            break;
        case "WAITING_FOR_RENDEZVOUS":
            var title = "Waiting for Rendezvous";
            var color = "orange";
            var line = GOOD + GOOD + BAD + BAD + "   " + BAD;
            break;
        case "REQUESTING_PROVIDER":
            var title = "Requesting Provider";
            var color = "orange";
            var line = GOOD + GOOD + GOOD + BAD + "   " + BAD;
            break;
        case "WAITING_FOR_PROVIDER":
            var title = "Waiting For Provider";
            var color = "orange";
            var line = GOOD + GOOD + GOOD + BAD + "   " + BAD;
            break;
        case "WAITING_FOR_DOWNSTREAM":
            var title = "Waiting For Downstream";
            var color = "orange";
            var line = GOOD + GOOD + GOOD + BAD + "   " + BAD;
            break;
        case "WAITING_FOR_CONSUMER":
            var title = "Waiting For Consumer";
            var color = "orange";
            var line = GOOD + GOOD + GOOD + BAD + "   " + BAD;
            break;
        case "CONNECTED":
            var title = "Connected";
            var color = "green";
            var line = (GOOD + GOOD + GOOD + GOOD + "   " + COMPLETE);
            break;
//      case "CONNECTION_FAILED":
//          var title = "Connection Failed";
//          var color = "red";
//          var line = (BAD + BAD + BAD + BAD + "   " + INCOMPLETE);
//          break;
        }
        D.deleteChildren(this.div);
        var d = D.emptyDiv(this.div, "flex flex-col")
        this.setConnectingTitle(d, title, color);
        this.setProgressLine(d, line);
    }

    drawStackEvent(layer_name, event) {
        switch (layer_name) {
        case "OUTGOING_WEBSOCKET":
            switch (event) {
            case "NEXUS_CREATED":
                this.draw("CONNECTING_WEBSOCKET");
                break;
            case "NEXUS_WAITING":
                this.draw("CONNECTING_WEBSOCKET");
                break;
            case "NEXUS_ANNOUNCED":
                break;
            case "NEXUS_REVOKED":
                this.draw("DISCONNECTED");
                break;
            case "NEXUS_DESTROYED":
                this.draw("DISCONNECTED");
                break;
            }
            break;
        case "OUTGOING_RENDEZVOUS":
            switch (event) {
            case "NEXUS_CREATED":
                this.draw("WAITING_FOR_RENDEZVOUS");
                break;
            case "NEXUS_WAITING":
                this.draw("WAITING_FOR_RENDEZVOUS");
                break;
            case "NEXUS_ANNOUNCED":
                break;
            case "NEXUS_REVOKED":
                break;
            case "NEXUS_DESTROYED":
                break;
            }
            break;
        case "CONSUMER":
            switch (event) {
            case "NEXUS_CREATED":
                this.draw("WAITING_FOR_PROVIDER");
                break;
            case "NEXUS_WAITING":
                this.draw("WAITING_FOR_PROVIDER");
                break;
            case "NEXUS_ANNOUNCED":
                this.draw("CONNECTED");
                break;
            case "NEXUS_REVOKED":
                break;
            case "NEXUS_DESTROYED":
                break;
            }
            break;
        case "PROVIDER":
            switch (event) {
            case "NEXUS_CREATED":
                this.draw("WAITING_FOR_CONSUMER");
                break;
            case "NEXUS_WAITING":
                this.draw("WAITING_FOR_CONSUMER");
                break;
            case "NEXUS_ANNOUNCED":
                this.draw("CONNECTED");
                break;
            case "NEXUS_REVOKED":
                break;
            case "NEXUS_DESTROYED":
                break;
            }
            break;
        }
    }
}


exports.ConnectProgress = ConnectProgress;
