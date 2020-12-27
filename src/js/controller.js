// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var ScanInterpret = require("./scan-interpret.js").ScanInterpret;

class CostanzaController {
    constructor(model, view) {
        this.scan_interpret = new ScanInterpret();
        this.model = model;
        this.view = view;

        this.view.onscanresult = (function(scan_str) {
            this.postScanResult(scan_str);
        }).bind(this);
    }

    connectToAppConsumer(scan_str) {
        console.log("app consumer connect stub");
    }

    connectToWalletProvider(scan_str) {
        console.log("wallet provider connect stub");
    }

    postScanResult(scan_str) {
        var action = this.scan_interpret.interpret_action(scan_str);
        console.log("interpeted action: " + action);
        switch (action) {
        case "PAY_BOLT11_MANUALLY":
            // TODO
            this.view.changeToPayBolt11(scan_str);
            break;
        case "PAY_BOLT11_MANUALLY_ERROR":
            this.view.changeToError(
                "Cannot pay Bolt11. Wallet is not currenlty connected to " +
                "wallet provider");
            break;
        case "CONNECT_WALLET_BEACON":
            // TODO
            //this.view.changeToConnect(scan_str);
            this.view.changeToMain();
            this.connectToWalletProvider(scan_str);
            break;
        case "CONNECT_APP_BEACON":
            // TODO
            //this.view.changeToConnect(scan_str);
            this.view.changeToMain();
            this.connectToAppConsumer(scan_str);
            break;
        case "CONNECT_BEACON_ERROR":
            this.view.changeToError(
                "Cannot connect to beacon. Wallet already has expected " +
                "connections and must disconnect to connect to a different" +
                "wallet provider or application.");
            break;
        case "PARSE_ERROR":
            this.view.changeToError("Could not understand: " + scan_str);
            break;
        }
    }

    start() {
        this.view.changeToMain();
    }
}


exports.CostanzaController = CostanzaController;
