// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var ScanInterpret = require("./scan-interpret.js").ScanInterpret;

class CostanzaController {
    constructor(model, view) {
        this.scan_interpret = new ScanInterpret(model);
        this.model = model;
        this.view = view;
        this.setupView();
        this.setupModel();
    }

    setupView() {
        this.view.onscanresult = (function(scan_str) {
            this.postScanResult(scan_str);
        }).bind(this);
        this.view.ongeneratewalletbeaconselect = (function() {
            var beacon = this.model.generateNewBeacon();
            this.postScanResult(beacon);
        }).bind(this);
        this.view.ongenerateappbeaconselect = (function() {
            console.log("generate app beacon");
            var beacon = this.model.generateNewBeacon();
            this.postScanResult(beacon);
        }).bind(this);
        this.view.onconnectstoredwalletselect = (function() {
            var beacon = this.model.getStoredConsumerBeacon();
            this.postScanResult(beacon);
        }).bind(this);
        this.view.onconnectstoredappselect = (function() {
            var beacon = this.model.getStoredProviderBeacon();
            this.postScanResult(beacon);
        }).bind(this);
        this.view.onforgetwalletbeaconselect = (function() {
            this.model.clearStoredConsumerBeacon();
            this.view.changeToConnectWallet()
        }).bind(this);
        this.view.onforgetappbeaconselect = (function() {
            this.model.clearStoredProviderBeacon();
            this.view.changeToConnectApp()
        }).bind(this);
        this.view.ondisconnectselect = (function() {
            this.model.disconnectAll();
            this.view.changeToMain();
        }).bind(this);
        this.view.ondisconnectproviderselect = (function() {
            this.model.disconnectProvider();
            this.view.changeToMain();
        }).bind(this);
        this.view.onproviderwadchange = (function(new_wad) {
            this.model.setNewProviderWad(new_wad);
            this.model.providerNotifyChange();
        }).bind(this);
        this.view.onproviderpayeechange = (function(payee) {
            this.model.setNewProviderPayee(payee);
            this.model.providerNotifyChange();
        }).bind(this);
        this.view.onproviderpayerchange = (function(payer) {
            this.model.setNewProviderPayer(payer);
            this.model.providerNotifyChange();
        }).bind(this);
    }

    setupModel() {
        this.model.onconsumerstackevent = (function(layer_name, event) {
            this.view.postWalletConnectEvent(layer_name, event);
        }).bind(this);
        this.model.onproviderstackevent = (function(layer_name, event) {
            this.view.postAppConnectEvent(layer_name, event);
        }).bind(this);
        this.model.onconsumeronline = (function() {
            this.view.changeToMain();
        }).bind(this);
        this.model.onconsumeroffline = (function() {
            this.view.changeToMain();
        }).bind(this);
        this.model.onprovideronline = (function() {
            this.view.changeToAppConsumerSetup()
        }).bind(this);
        this.model.onprovideroffline = (function() {
            this.view.changeToMain();
        }).bind(this);
        this.model.onconsumerproviderinfochange = (function() {
            this.view.redrawDynamicInfo();
        }).bind(this);
        this.model.onping = (function() {
            this.view.redrawDynamicInfo();
        }).bind(this);
        this.model.onreceiptchange = (function(uuid) {
            this.view.redrawReceiptInfo(uuid);
        }).bind(this);
        this.model.onmanualinvoice = (function(bolt11) {
            this.view.changeToAskPay(bolt11);
        }).bind(this);
    }

    connectToAppConsumer(beacon) {
        this.view.changeToConnectingApp();
        this.model.connectToAppConsumer(beacon);
    }

    connectToWalletProvider(beacon) {
        this.view.changeToConnectingWallet();
        this.model.connectToWalletProvider(beacon);
    }

    storeWalletBeacon(beacon) {
        this.model.setEphemeralConsumerBeacon(beacon);
        if (this.model.hasStoredConsumerBeacon()) {
            return;
        }
        this.model.storeConsumerBeacon(beacon);
    }

    storeAppBeacon(beacon) {
        this.model.setEphemeralProviderBeacon(beacon);
        if (this.model.hasStoredProviderBeacon()) {
            return;
        }
        this.model.storeProviderBeacon(beacon);
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
            this.storeWalletBeacon(scan_str);
            this.connectToWalletProvider(scan_str);
            break;
        case "CONNECT_APP_BEACON":
            // TODO
            //this.view.changeToConnect(scan_str);
            this.storeAppBeacon(scan_str);
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

    stop() {
        this.model.cleanUp();
    }
}


exports.CostanzaController = CostanzaController;
