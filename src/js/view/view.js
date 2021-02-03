// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const D = require('../utl/dom.js').DomUtl;

const CONNECT_STATE = require('../model/model.js').CONNECT_STATE;

const MainScreen = require("./screen/main.js").MainScreen;
const MenuScreen = require("./screen/menu.js").MenuScreen;
const ScanScreen = require("./screen/scan.js").ScanScreen;
const ErrorScreen = require("./screen/error.js").ErrorScreen;
const ConnectWalletScreen = require("./screen/connect.js").ConnectWalletScreen;
const ConnectingWalletScreen = require(
    "./screen/connecting.js").ConnectingWalletScreen;
const ConnectedWalletScreen = require(
    "./screen/connected-wallet.js").ConnectedWalletScreen;
const ConnectAppScreen = require("./screen/connect.js").ConnectAppScreen;
const ConnectingAppScreen = require(
    "./screen/connecting.js").ConnectingAppScreen;
const ConnectedAppScreen = require(
    "./screen/connected-app.js").ConnectedAppScreen;
const ManualReceiveScreen = require(
    "./screen/manual-receive.js").ManualReceiveScreen;
const ManualProvideInvoiceScreen = require(
    "./screen/manual-provide-invoice.js").ManualProvideInvoiceScreen;
const ManualSendScreen = require("./screen/manual-send.js").ManualSendScreen;
const StorageSettingsScreen = require(
    "./screen/storage-settings.js").StorageSettingsScreen;
const AboutScreen = require("./screen/about.js").AboutScreen;
const DrillLevelOneScreen = require(
    "./screen/drill-level-one.js").DrillLevelOneScreen;
const DrillLevelTwoScreen = require(
    "./screen/drill-level-two.js").DrillLevelTwoScreen;


class CostanzaView {
    constructor(app_div, model) {
        this.app_div = app_div;
        this.model = model;
        this.main_screen = this.setupMainScreen(this.app_div);
        this.scan_screen = this.setupScanScreen(this.app_div);
        this.error_screen = this.setupErrorScreen(this.app_div);
        this.menu_screen = this.setupMenuScreen(this.app_div);
        this.connect_wallet_screen =
            this.setupConnectWalletScreen(this.app_div);
        this.connecting_wallet_screen =
            this.setupConnectingWalletScreen(this.app_div);
        this.connected_wallet_screen =
            this.setupConnectedWalletScreen(this.app_div);
        this.connect_app_screen =
            this.setupConnectAppScreen(this.app_div);
        this.connecting_app_screen =
            this.setupConnectingAppScreen(this.app_div);
        this.connected_app_screen =
            this.setupConnectedAppScreen(this.app_div);
        this.manual_receive_screen =
            this.setupManualReceiveScreen(this.app_div);
        this.manual_provide_invoice_screen =
            this.setupManualProvideInvoiceScreen(this.app_div);
        this.manual_send_screen =
            this.setupManualSendScreen(this.app_div);
        this.storage_settings_screen =
            this.setupStorageSettingsScreen(this.app_div);
        this.about_screen = this.setupAboutScreen(this.app_div);
        this.drill_level_one_screen =
            this.setupDrillLevelOneScreen(this.app_div);
        this.drill_level_two_screen =
            this.setupDrillLevelTwoScreen(this.app_div);

        this.receipt_screen = null;
        this.bolt11_screen = null;

        this.onscanresult = null;

        this.ongeneratewalletbeaconselect = null;
        this.ongenerateappbeaconselect = null;
        this.onconnectstoredwalletselect = null;
        this.onconnectstoredappselect = null;
        this.onforgetwalletbeaconselect = null;
        this.onforgetappbeaconselect = null;
        this.ondisconnectselect = null;
        this.ondisconnectproviderselect = null;

        this.onproviderwadchange = null;
        this.onproviderpayeechange = null;
        this.onproviderpayerchange = null;

        this.oninvoicerequest = null;
        this.onpayrequest = null;

        this.onpersistprofilechange = null;
        this.onpersistprofileclear = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // setup screens
    ///////////////////////////////////////////////////////////////////////////

    setupMainScreen(div) {
        var s = new MainScreen(div, this.model);
        s.onconnectwalletclick = (function() {
            this.changeToWalletProviderSetup();
        }).bind(this);
        s.onconnectappclick = (function() {
            this.changeToAppConsumerSetup();
        }).bind(this);
        s.onscanclick = (function() {
            this.changeToScan();
            this.scan_screen.startScanning();
        }).bind(this);
        s.onmenuclick = (function() {
            this.changeToMenu();
        }).bind(this);
        s.onreceiptclick = (function(receipt) {
            this.changeToReceipt(receipt);
        }).bind(this);
        return s;
    }

    setupMenuScreen(div) {
        var s = new MenuScreen(div);
        s.onbackclick = (function() {
            this.changeToMain();
        }).bind(this);
        s.onwalletproviderclick = (function() {
            this.changeToWalletProviderSetup();
        }).bind(this);
        s.onappconsumerclick = (function() {
            this.changeToAppConsumerSetup();
        }).bind(this);
        s.onbolt11receiveclick = (function() {
            this.changeToBolt11Receive();
        }).bind(this);
        s.onstoragesettingsclick = (function() {
            this.changeToStorageSettings();
        }).bind(this);
        s.onaboutclick = (function() {
            this.changeToAbout();
        }).bind(this);
        return s;
    }

    setupScanScreen(div) {
        var s = new ScanScreen(div);
        s.onbackclick = (function() {
            this.scan_screen.stopScanning();
            this.changeToMain();
        }).bind(this);
        s.onscanresult = (function(result) {
            this.scan_screen.stopScanning();
            this.onscanresult(result);
        }).bind(this);
        return s;
    }

    setupErrorScreen(div) {
        var s = new ErrorScreen(div);
        s.onokclick = (function() {
            this.changeToMain();
        }).bind(this);
        return s;
    }

    setupConnectWalletScreen(div) {
        var s = new ConnectWalletScreen(div, this.model);
        s.onbackclick = (function() {
            this.changeToMain();
        }).bind(this);
        s.onbeaconselect = (function(result) {
            this.onscanresult(result);
        }).bind(this);
        s.ongenerateselect = (function() {
            this.ongeneratewalletbeaconselect();
        }).bind(this);
        s.onscanselect = (function() {
            this.changeToScan();
            this.scan_screen.startScanning();
        }).bind(this);
        s.onconnectstoredselect = (function() {
            this.onconnectstoredwalletselect();
        }).bind(this);
        s.onforgetselect = (function() {
            this.onforgetwalletbeaconselect();
        }).bind(this);
        return s;
    }

    setupConnectingWalletScreen(div) {
        var s = new ConnectingWalletScreen(div, this.model);
        s.ondisconnectclick = (function() {
            this.ondisconnectselect();
        }).bind(this);
        return s;
    }

    setupConnectedWalletScreen(div) {
        var s = new ConnectedWalletScreen(div, this.model);
        s.onbackclick = (function() {
            this.changeToMain();
        }).bind(this);
        s.ondisconnectclick = (function() {
            this.ondisconnectselect();
        }).bind(this);
        return s;
    }

    setupConnectAppScreen(div) {
        var s = new ConnectAppScreen(div, this.model);
        s.onbackclick = (function() {
            this.changeToMain();
        }).bind(this);
        s.onbeaconselect = (function(result) {
            this.onscanresult(result);
        }).bind(this);
        s.ongenerateselect = (function() {
            this.ongenerateappbeaconselect();
        }).bind(this);
        s.onscanselect = (function() {
            this.changeToScan();
            this.scan_screen.startScanning();
        }).bind(this);
        s.onconnectstoredselect = (function() {
            this.onconnectstoredappselect();
        }).bind(this);
        s.onforgetselect = (function() {
            this.onforgetappbeaconselect();
        }).bind(this);
        return s;
    }

    setupConnectingAppScreen(div) {
        var s = new ConnectingAppScreen(div, this.model);
        s.ondisconnectclick = (function() {
            this.ondisconnectselect();
        }).bind(this);
        return s;
    }

    setupConnectedAppScreen(div) {
        var s = new ConnectedAppScreen(div, this.model);
        s.onbackclick = (function() {
            this.changeToMain();
        }).bind(this);
        s.ondisconnectclick = (function() {
            this.ondisconnectproviderselect();
        }).bind(this);
        s.oninputerror = (function(error_str) {
            this.changeToError("could not interpet: " + error_str);
        }).bind(this);
        s.onwadchange = (function(new_wad) {
            this.onproviderwadchange(new_wad);
            this.redrawDynamicInfo();
        }).bind(this);
        s.onpayerchange = (function(new_payer) {
            this.onproviderpayerchange(new_payer);
            this.redrawDynamicInfo();
        }).bind(this);
        s.onpayeechange = (function(new_payee) {
            this.onproviderpayeechange(new_payee);
            this.redrawDynamicInfo();
        }).bind(this);
        return s;
    }

    setupManualReceiveScreen(div) {
        var s = new ManualReceiveScreen(div, this.model);
        s.onbackclick = (function() {
            this.changeToMenu();
        }).bind(this);
        s.oninputerror = (function(error_str) {
            this.changeToError("could not interpet: " + error_str);
        }).bind(this);
        s.oninvoicerequest = (function(msats) {
            this.oninvoicerequest(msats);
        }).bind(this);
        return s;
    }

    setupManualProvideInvoiceScreen(div) {
        var s = new ManualProvideInvoiceScreen(div, this.model);
        s.onbackclick = (function() {
            this.changeToMenu();
        }).bind(this);
        return s;
    }

    setupManualSendScreen(div) {
        var s = new ManualSendScreen(div, this.model);
        s.onbackclick = (function() {
            this.changeToMenu();
        }).bind(this);
        s.onpayerror = (function(error_str) {
            this.changeToError("could not pay: " + error_str);
        }).bind(this);
        s.onpayrequest = (function(bolt11) {
            this.onpayrequest(bolt11);
        }).bind(this);
        return s;
    }

    setupStorageSettingsScreen(div) {
        var s = new StorageSettingsScreen(div, this.model);
        s.onbackclick = (function() {
            this.changeToMenu();
        }).bind(this);
        s.onprofilechange = (function(profile) {
            this.onpersistprofilechange(profile);
        }).bind(this);
        s.onclearclick = (function(profile) {
            this.onpersistprofileclear(profile);
        }).bind(this);
        return s;
    }

    setupAboutScreen(div) {
        var s = new AboutScreen(div);
        s.onbackclick = (function() {
            this.changeToMenu();
        }).bind(this);
        return s;
    }

    setupDrillLevelOneScreen(div) {
        var s = new DrillLevelOneScreen(div, this.model);
        s.onbackclick = (function() {
            this.changeToMain();
        }).bind(this);
        s.onentryclick = (function(receipt, entry) {
            this.changeToReceiptEntry(receipt, entry);
        }).bind(this);
        return s;
    }

    setupDrillLevelTwoScreen(div) {
        var s = new DrillLevelTwoScreen(div, this.model);
        s.onbackclick = (function(receipt) {
            this.changeToReceipt(receipt);
        }).bind(this);
        return s;
    }

    ///////////////////////////////////////////////////////////////////////////
    // model events
    ///////////////////////////////////////////////////////////////////////////

    postWalletConnectEvent(layer_name, event) {
        this.connecting_wallet_screen.postConnectEvent(layer_name, event);
    }

    postAppConnectEvent(layer_name, event) {
        this.connecting_app_screen.postConnectEvent(layer_name, event);
    }

    ///////////////////////////////////////////////////////////////////////////
    // goto ui
    ///////////////////////////////////////////////////////////////////////////

    changeToMain() {
        D.deleteChildren(this.app_div);
        this.main_screen.draw();
    }

    redrawDynamicInfo() {
        this.main_screen.redrawInfo();
        this.connected_wallet_screen.redrawInfo();
        this.connected_app_screen.redrawInfo();
    }

    redrawReceiptInfo(uuid) {
        this.main_screen.redrawReceiptInfo(uuid);
        this.drill_level_one_screen.redrawUuid(uuid);
    }

    changeToScan() {
        D.deleteChildren(this.app_div);
        this.scan_screen.draw();
    }

    changeToError(error_str) {
        D.deleteChildren(this.app_div);
        this.error_screen.draw(error_str);
    }

    changeToMenu() {
        console.log("change to main");
        D.deleteChildren(this.app_div);
        this.menu_screen.draw();
    }

    changeToReceipt(receipt) {
        D.deleteChildren(this.app_div);
        this.drill_level_one_screen.draw(receipt);
    }

    changeToReceiptEntry(receipt, entry) {
        D.deleteChildren(this.app_div);
        this.drill_level_two_screen.draw(receipt, entry);
    }

    changeToManualSend(bolt11) {
        D.deleteChildren(this.app_div);
        this.manual_send_screen.draw(bolt11);
    }

    changeToConnectWallet(beacon) {
        D.deleteChildren(this.app_div);
        this.connect_wallet_screen.draw();
    }

    changeToConnectApp(beacon) {
        D.deleteChildren(this.app_div);
        this.connect_app_screen.draw();
    }

    changeToConnectingWallet() {
        D.deleteChildren(this.app_div);
        this.connecting_wallet_screen.draw();
    }

    changeToConnectingApp() {
        D.deleteChildren(this.app_div);
        this.connecting_app_screen.draw();
    }

    changeToAbout(beacon) {
        D.deleteChildren(this.app_div);
        this.about_screen.draw();
    }

    changeToManualProvideInvoice(bolt11) {
        D.deleteChildren(this.app_div);
        this.manual_provide_invoice_screen.draw(bolt11);
    }

    changeToWalletProviderSetup() {
        D.deleteChildren(this.app_div);
        switch (this.model.getConsumerConnectState()) {
        case CONNECT_STATE.CONNECTED:
            this.connected_wallet_screen.draw();
            break;
        case CONNECT_STATE.CONNECTING:
            this.connecting_wallet_screen.draw();
            break;
        case CONNECT_STATE.DISCONNECTED:
            this.connect_wallet_screen.draw();
            break;
        default:
            console.error("unknown state");
            break;
        }
    }

    changeToAppConsumerSetup() {
        D.deleteChildren(this.app_div);
        switch (this.model.getProviderConnectState()) {
        case CONNECT_STATE.CONNECTED:
            this.connected_app_screen.draw();
            break;
        case CONNECT_STATE.CONNECTING:
            this.connecting_app_screen.draw();
            break;
        case CONNECT_STATE.DISCONNECTED:
            this.connect_app_screen.draw();
            break;
        default:
            console.error("unknown state");
            break;
        }
    }

    changeToBolt11Receive() {
        D.deleteChildren(this.app_div);
        switch (this.model.getConsumerConnectState()) {
        case CONNECT_STATE.CONNECTED:
            this.manual_receive_screen.draw();
            break;
        case CONNECT_STATE.CONNECTING:
        case CONNECT_STATE.DISCONNECTED:
            this.error_screen.draw("must be connected to wallet provider");
            break;
        default:
            console.error("unknown state");
            break;
        }
    }

    changeToStorageSettings() {
        console.log("storage settings stub");
        D.deleteChildren(this.app_div);
        this.storage_settings_screen.draw();
    }
}


exports.CostanzaView = CostanzaView;
