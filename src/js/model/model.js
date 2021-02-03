// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const Uuid = require("moneysocket").Uuid;
const Timestamp = require("moneysocket").Timestamp;
const Wad = require("moneysocket").Wad;
const Bolt11 = require("moneysocket").Bolt11;

const MoneysocketBeacon = require('moneysocket').MoneysocketBeacon;
const WebsocketLocation = require('moneysocket').WebsocketLocation;

const ProviderStack = require('moneysocket').ProviderStack;
const ConsumerStack = require('moneysocket').ConsumerStack;
const Balance = require("./balance.js").Balance;
const Transact = require("./transact.js").Transact;
const Receipts = require("./receipts.js").Receipts;
const Persist = require("./persist.js").Persist;


const DEFAULT_HOST = "relay.socket.money";
const DEFAULT_PORT = 443;
const DEFAULT_USE_TLS = true;


const CONNECT_STATE = {
    DISCONNECTED: 'DISCONNECTED',
    CONNECTING:   'CONNECTING',
    CONNECTED:    'CONNECTED',
}


class CostanzaModel {
    constructor() {
        this.provider_stack = this.setupProviderStack();
        this.provider_state = CONNECT_STATE.DISCONNECTED;
        this.consumer_stack = this.setupConsumerStack();
        this.consumer_state = CONNECT_STATE.DISCONNECTED;
        this.persist = new Persist();
        this.balance = new Balance(this);
        this.transact = new Transact(this);
        this.receipts = new Receipts(this);

        this.consumer_reported_info = null;
        this.consumer_last_ping = 0;

        this.onconsumerstackevent = null;
        this.onconsumeronline = null;
        this.onconsumeroffline = null;
        this.onconsumerproviderinfochange = null;
        this.onping = null;

        this.onprovideronline = null;
        this.onprovideroffline = null;
        this.onproviderstackevent = null;
        this.onreceiptchange = null;

        this.onmanualinvoice = null;
        this.onmanualpreimage = null;

        console.log("consumer_beacon: " + this.getStoredConsumerBeacon());
        this.ephemeral_wallet_beacon = this.getStoredConsumerBeacon();
        console.log("provider_beacon: " + this.getStoredProviderBeacon());
        this.ephemeral_app_beacon = this.getStoredProviderBeacon();

        if (! this.hasStoredAccountUuid()) {
            this.storeAccountUuid(Uuid.uuidv4());
        }
    }

    setupProviderStack() {
        var s = new ProviderStack();
        s.onannounce = (function(nexus) {
            this.providerOnAnnounce(nexus);
        }).bind(this);
        s.onrevoke = (function(nexus) {
            this.providerOnRevoke(nexus);
        }).bind(this);
        s.onstackevent = (function(layer_name, nexus, status) {
            this.providerOnStackEvent(layer_name, nexus, status);
        }).bind(this);
        s.handleinvoicerequest = (function(msats, request_uuid) {
            this.providerHandleInvoiceRequest(msats, request_uuid);
        }).bind(this);
        s.handlepayrequest = (function(bolt11, request_uuid) {
            this.providerHandlePayRequest(bolt11, request_uuid);
        }).bind(this);
        s.handleproviderinforequest = (function() {
            return this.handleProviderInfoRequest();
        }).bind(this);
        return s;
    }

    setupConsumerStack() {
        var s = new ConsumerStack();
        s.onannounce = (function(nexus) {
            this.consumerOnAnnounce(nexus);
        }).bind(this);
        s.onrevoke = (function(nexus) {
            this.consumerOnRevoke(nexus);
        }).bind(this);
        s.onproviderinfo = (function(provider_info) {
            this.consumerOnProviderInfo(provider_info);
        }).bind(this);
        s.onstackevent = (function(layer_name, nexus, status) {
            this.consumerOnStackEvent(layer_name, nexus, status);
        }).bind(this);
        s.onping = (function(msecs) {
            this.consumer_last_ping = msecs;
            this.consumerOnPing();
        }).bind(this);
        s.oninvoice = (function(bolt11, request_reference_uuid) {
            this.consumerOnInvoice(bolt11, request_reference_uuid);
        }).bind(this);
        s.onpreimage = (function(preimage, request_reference_uuid) {
            this.consumerOnPreimage(preimage, request_reference_uuid);
        }).bind(this);
        return s;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Manual requests
    ///////////////////////////////////////////////////////////////////////////

    manualInvoiceRequest(msats) {
        var request_uuid = Uuid.uuidv4();
        this.consumer_stack.requestInvoice(msats, request_uuid);
        this.transact.invoiceRequestedManual(msats, request_uuid);
        this.receipts.manualReceiveStart(msats, request_uuid);
    }

    manualPayRequest(bolt11) {
        var request_uuid = Uuid.uuidv4();
        this.consumer_stack.requestPay(bolt11, request_uuid);
        this.transact.payRequestedManual(bolt11, request_uuid);
        this.receipts.manualSendStart(bolt11, request_uuid);
    }


    ///////////////////////////////////////////////////////////////////////////
    // Consumer Stack Callbacks
    ///////////////////////////////////////////////////////////////////////////

    consumerOnAnnounce(nexus) {
        console.log("consumer announce");
        this.consumer_state = CONNECT_STATE.CONNECTED;
        if (this.onconsumeronline != null) {
            this.onconsumeronline();
        }
    }

    consumerOnRevoke(nexus) {
        console.log("consumer revoke");
        this.consumer_state = CONNECT_STATE.DISCONNECTED;
        this.consumer_reported_info = null;
        if (this.onconsumeroffline != null) {
            this.onconsumeroffline();
        }
    }

    consumerOnStackEvent(layer_name, nexus, status) {
        if ((layer_name == "OUTGOING_WEBSOCKET") &&
            (status == "NEXUS_DESTROYED"))
        {
            this.consumer_state = CONNECT_STATE.DISCONNECTED;
        }
        if (this.onconsumerstackevent != null) {
            this.onconsumerstackevent(layer_name, status);
        }
    }

    consumerOnProviderInfo(provider_info) {
        console.log("consumer provider info: " + JSON.stringify(provider_info));
        this.consumer_reported_info = provider_info;
        this.balance.setIncomingProviderInfo(provider_info['wad'],
                                             provider_info['payee'],
                                             provider_info['payer']);
        this.providerNotifyChange();
        if (this.onconsumerproviderinfochange != null) {
            this.onconsumerproviderinfochange();
        }
    }

    consumerOnPing() {
        if (this.onping != null) {
            this.onping();
        }
    }

    consumerOnInvoice(bolt11, request_reference_uuid) {
        console.log("got invoice from consumer: " + request_reference_uuid);
        var [socket, err] = (
            this.transact.invoiceNotified(bolt11, request_reference_uuid));

        if (err != null) {
            console.log("invoice error: " + err);
            if (socket) {
                this.receipts.socketSessionErrNotified(err);
                // TODO - send error on socket with uuid reference
                return;
            }
            // TODO - present manual invoice error on screen
            return;
        }

        if (socket) {
            this.receipts.socketSessionInvoiceNotified(bolt11,
                request_reference_uuid);
            this.provider_stack.fulfilRequestInvoice(bolt11,
                                                     request_reference_uuid);
            return;
        }
        this.receipts.manualReceiveGotInvoice(bolt11, request_reference_uuid);
        console.log("got manual invoice: " + bolt11);
        if (this.onmanualinvoice != null) {
            this.onmanualinvoice(bolt11);
        }
    }

    consumerOnPreimage(preimage, request_reference_uuid) {
        console.log("got preimage from consumer: " + preimage);
        var [socket, increment, msats] = (
            this.transact.preimageNotified(preimage));

        console.log("socket: " + socket);
        console.log("increment: " + increment);
        console.log("msats: " + msats);

        if (socket == null) {
            var err = "unknown preimage: " + preimage;
            console.log(err);
            return;
        }
        // TODO -log receipt

        if (socket) {
            this.receipts.socketSessionPreimageNotified(preimage, increment,
                msats, request_reference_uuid);
            if (increment) {
                this.balance.incrementSocketBalance(msats);
            } else {
                this.balance.decrementSocketBalance(msats);
                // TODO account for network fee?
            }
            this.provider_stack.fulfilRequestPay(preimage,
                                                 request_reference_uuid);
            this.provider_stack.sendProviderInfoUpdate();
            return;
        }
        // TODO account for network fee?
        if (increment) {
            this.receipts.manualReceivePaid(preimage);
        } else {
            this.receipts.manualSendGotPreimage(preimage);
        }
        if (this.onmanualpreimage != null) {
            this.onmanualpreimage();
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Provider Stack Callbacks
    ///////////////////////////////////////////////////////////////////////////

    providerOnAnnounce(nexus) {
        this.provider_state = CONNECT_STATE.CONNECTED;
        this.receipts.socketSessionStart();
        console.log("provider announce");
        if (this.onprovideronline != null) {
            this.onprovideronline();
        }
    }

    providerOnRevoke() {
        this.provider_state = CONNECT_STATE.DISCONNECTED;
        this.receipts.socketSessionEnd();
        console.log("provider revoke");
        if (this.onprovideroffline != null) {
            this.onprovideroffline();
        }
    }

    providerOnStackEvent(layer_name, nexus, status) {
        if ((layer_name == "OUTGOING_WEBSOCKET") &&
            (status == "NEXUS_DESTROYED"))
        {
            this.provider_state = CONNECT_STATE.DISCONNECTED;
        }
        if (this.onproviderstackevent != null) {
            this.onproviderstackevent(layer_name, status);
        }
    }

    providerHandleInvoiceRequest(msats, request_uuid) {
        console.log("got invoice request from provider: " + request_uuid);
        // TODO log receipt
        this.receipts.socketSessionInvoiceRequest(msats, request_uuid);
        var err = this.transact.checkInvoiceRequestSocket();
        if (err != null) {
            this.receipts.socketSessionErrNotified(err);
            console.log("err: " + err);
            // TODO send error message
            return;
        }
        this.consumer_stack.requestInvoice(msats, request_uuid);
        this.transact.invoiceRequestedSocket(msats, request_uuid);
    }

    providerHandlePayRequest(bolt11, request_uuid) {
        console.log("got pay request from provider: " + request_uuid);
        this.receipts.socketSessionPayRequest(bolt11, request_uuid);
        var err = this.transact.checkPayRequestSocket(bolt11);
        if (err != null) {
            this.receipts.socketSessionErrorNotified(err);
            console.log("err: " + err);
            // TODO send error message
            return;
        }
        this.consumer_stack.requestPay(bolt11, request_uuid);
        this.transact.payRequestedSocket(bolt11, request_uuid);
    }

    handleProviderInfoRequest(shared_seed) {
        console.log("provider info request");
        var p = this.balance.getSocketProviderInfo();
        //console.log("p: " + JSON.stringify(p));
        return p;
    }

    ///////////////////////////////////////////////////////////////////////////
    // provider
    ///////////////////////////////////////////////////////////////////////////

    providerNotifyChange() {
        if (this.provider_state != CONNECT_STATE.CONNECTED) {
            return;
        }
        this.provider_stack.sendProviderInfoUpdate();
    }

    setNewProviderWad(wad) {
        this.balance.setSocketWad(wad);
    }

    setNewProviderPayee(payee) {
        this.balance.setSocketPayee(payee);
    }

    setNewProviderPayer(payer) {
        this.balance.setSocketPayer(payer);
    }

    ///////////////////////////////////////////////////////////////////////////
    // call-ins
    ///////////////////////////////////////////////////////////////////////////

    connectToWalletProvider(beacon_str) {
        console.log("connect wallet: " + beacon_str);
        var [beacon, err] = MoneysocketBeacon.fromBech32Str(beacon_str);
        if (err != null) {
            console.log("could not interpret: " + beacon_str + " : " + err);
            return
        }
        this.consumer_state = CONNECT_STATE.CONNECTING;
        this.consumer_stack.doConnect(beacon);
    }

    connectToAppConsumer(beacon_str) {
        console.log("connect app: " + beacon_str);
        var [beacon, err] = MoneysocketBeacon.fromBech32Str(beacon_str);
        if (err != null) {
            console.log("could not interpret: " + beacon_str + " : " + err);
            return
        }
        this.provider_state = CONNECT_STATE.CONNECTING;
        this.provider_stack.doConnect(beacon);
    }

    disconnectAll() {
        this.provider_state = CONNECT_STATE.DISCONNECTED;
        this.provider_stack.doDisconnect();
        this.consumer_state = CONNECT_STATE.DISCONNECTED;
        this.consumer_stack.doDisconnect();
    }

    disconnectProvider() {
        this.provider_state = CONNECT_STATE.DISCONNECTED;
        this.provider_stack.doDisconnect();
    }

    ///////////////////////////////////////////////////////////////////////////
    // get consumer state
    ///////////////////////////////////////////////////////////////////////////

    getConsumerBalanceWad() {
        if (this.consumer_reported_info == null) {
            console.log("null stuff");
            return Wad.bitcoin(0);
        }
        return this.consumer_reported_info.wad;
    }

    getConsumerIsPayer() {
        if (this.consumer_reported_info == null) {
            return false;
        }
        return this.consumer_reported_info.payer;
    }

    getConsumerIsPayee() {
        if (this.consumer_reported_info == null) {
            return false;
        }
        return this.consumer_reported_info.payee;
    }

    getConsumerLastPing() {
        return this.consumer_last_ping;
    }

    getConsumerConnectState() {
        return this.consumer_state;
    }

    ///////////////////////////////////////////////////////////////////////////
    // consumer helpers
    ///////////////////////////////////////////////////////////////////////////

    msatsToWalletCurrencyWad(msats) {
        var wad = this.getConsumerBalanceWad();
        if (msats == 0) {
            return new Wad(0, wad['asset_stable'], 0,
                           wad['code'], wad['countries'], wad['decimals'],
                           wad['name'], wad['symbol']);
        }
        var clone = Wad.clone_msats(wad, msats);
        //console.log("cloned: " + clone.toString());
        return clone;
    }

    ///////////////////////////////////////////////////////////////////////////
    // consumer beacon
    ///////////////////////////////////////////////////////////////////////////

    setEphemeralConsumerBeacon(beacon) {
        this.ephemeral_wallet_beacon = beacon;
    }

    getEphemeralConsumerBeacon() {
        return this.ephemeral_wallet_beacon;
    }

    hasStoredConsumerBeacon() {
        return this.persist.hasStoredConsumerBeacon();
    }

    getStoredConsumerBeacon() {
        return this.persist.getStoredConsumerBeacon();
    }

    storeConsumerBeacon(beacon) {
        this.persist.storeConsumerBeacon(beacon);
    }

    clearStoredConsumerBeacon() {
        this.persist.clearStoredConsumerBeacon();
    }


    ///////////////////////////////////////////////////////////////////////////
    // get provider state
    ///////////////////////////////////////////////////////////////////////////

    getProviderBalanceWad() {
        return this.balance.calcSocketWad();
    }

    getProviderIsPayer() {
        return this.balance.calcSocketPayer();
    }

    getProviderIsPayee() {
        return this.balance.calcSocketPayee();
    }

    getProviderConnectState() {
        return this.provider_state;
    }

    ///////////////////////////////////////////////////////////////////////////
    // provider beacon
    ///////////////////////////////////////////////////////////////////////////

    setEphemeralProviderBeacon(beacon) {
        this.ephemeral_app_beacon = beacon;
    }

    getEphemeralProviderBeacon() {
        return this.ephemeral_app_beacon;
    }

    hasStoredProviderBeacon() {
        return this.persist.hasStoredProviderBeacon();
    }

    getStoredProviderBeacon() {
        return this.persist.getStoredProviderBeacon();
    }

    storeProviderBeacon(beacon) {
        this.persist.storeProviderBeacon(beacon);
    }

    clearStoredProviderBeacon() {
        this.persist.clearStoredProviderBeacon();
    }

    ///////////////////////////////////////////////////////////////////////////
    // account_uuid
    ///////////////////////////////////////////////////////////////////////////

    hasStoredAccountUuid() {
        return this.persist.hasStoredAccountUuid();
    }

    getStoredAccountUuid() {
        return this.persist.getStoredAccountUuid();
    }

    storeAccountUuid(uuid) {
        return this.persist.storeAccountUuid(uuid);
    }

    clearStoredAccountUuid() {
        return this.persist.clearStoredAccountUuid();
    }

    ///////////////////////////////////////////////////////////////////////////
    // receipts
    ///////////////////////////////////////////////////////////////////////////

    hasStoredReceipts() {
        return this.persist.hasStoredReceipts();
    }

    getStoredReceipts() {
        return this.persist.getStoredReceipts();
    }

    storeReceipts(receipts) {
        this.persist.storeReceipts(receipts);
    }

    clearStoredReceipts() {
        this.persist.clearStoredReceipts();
    }

    getReceipts() {
        return this.receipts.getCachedReceiptDict();
    }

    receiptsUpdated(uuid) {
        if (this.onreceiptchange != null) {
            this.onreceiptchange(uuid);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // storage settings info
    ///////////////////////////////////////////////////////////////////////////

    getStorageSettings() {
        var [profile, checkout_record] = this.persist.getStorageSettings();
        return [profile, checkout_record];
    }

    switchToProfile(profile) {
        this.persist.switchToProfile(profile);
        this.receipts.reloadCache();
    }

    clearProfile(profile) {
        this.persist.clearProfile(profile);
        this.receipts.reloadCache();
        this.storeAccountUuid(Uuid.uuidv4());
    }

    ///////////////////////////////////////////////////////////////////////////
    // general beacon
    ///////////////////////////////////////////////////////////////////////////

    generateNewBeacon() {
        var location = new WebsocketLocation(DEFAULT_HOST, DEFAULT_PORT,
                                             DEFAULT_USE_TLS);
        var beacon = new MoneysocketBeacon();
        beacon.addLocation(location);
        var beacon_str = beacon.toBech32Str();
        return beacon_str;
    }

    ///////////////////////////////////////////////////////////////////////////
    // clean up
    ///////////////////////////////////////////////////////////////////////////

    cleanUp() {
        if (this.provider_state == CONNECT_STATE.CONNECTED) {
            this.receipts.socketSessionEnd();
        }
        this.persist.yieldCheckedOutProfile();
    }
}


exports.CostanzaModel = CostanzaModel;
exports.CONNECT_STATE = CONNECT_STATE;
