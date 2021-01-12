// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php


const Uuid = require("moneysocket").Uuid;
const Timestamp = require("moneysocket").Timestamp;
const Wad = require("moneysocket").Wad;

const MoneysocketBeacon = require('moneysocket').MoneysocketBeacon;
const WebsocketLocation = require('moneysocket').WebsocketLocation;

const ProviderStack = require('moneysocket').ProviderStack;
const ConsumerStack = require('moneysocket').ConsumerStack;

const Balance = require("./balance.js").Balance;


var Receipts = [
    {'receipt_id':  Uuid.uuidv4(),
     'time':        Timestamp.getNowTimestamp(),
     'type':        'outgoing_bolt11',
     'bolt11':      'lnbcasdfasdfasd',
     'description': 'Sparkshot.io 300px: burp!',
     'value':       Wad.bitcoin(1000000),
    },
    {'receipt_id': Uuid.uuidv4(),
     'time':       Timestamp.getNowTimestamp(),
     'type':       'socket_session',
     'txs':        [{'socket_txid': Uuid.uuidv4(),
                     'direction':  'outgoing',
                     'status':     'settled',
                     'bolt11':     'lnbcasdfasdfasdlfajlsd',
                     'value':      Wad.bitcoin(123000),
                    },
                    {'socket_txid': Uuid.uuidv4(),
                     'direction':  'incoming',
                     'status':     'settled',
                     'bolt11':     'lnbc2342334',
                     'value':      Wad.bitcoin(22000),
                    },
                   ],
    },
    {'receipt_id':  Uuid.uuidv4(),
     'time':        Timestamp.getNowTimestamp(),
     'type':        'incoming_bolt11',
     'description': null,
     'value':       Wad.bitcoin(444444),
    },
    {'receipt_id':  Uuid.uuidv4(),
     'time':        Timestamp.getNowTimestamp(),
     'type':        'outgoing_bolt11',
     'bolt11':      'lnbcasdfasdfasd',
     'description': 'Jukebox Play: C.R.E.A.M. - Wu Tang Clan ',
     'value':       Wad.bitcoin(6150),
    },
];


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
        this.receipts = Receipts;
        this.provider_stack = this.setupProviderStack();
        this.provider_state = CONNECT_STATE.DISCONNECTED;
        this.consumer_stack = this.setupConsumerStack();
        this.consumer_state = CONNECT_STATE.DISCONNECTED;
        this.balance = new Balance(this);

        this.consumer_reported_info = null;
        this.consumer_last_ping = 0;

        this.onconsumerstackevent = null;
        this.onconsumeronline = null;
        this.onconsumeroffline = null;
        this.onconsumerproviderinfochange = null;
        this.onping = null;

        this.onproviderstackevent = null;

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
        console.log("consumer announce");
    }

    consumerOnPreimage(preimage, request_reference_uuid) {
        console.log("consumer revoke");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Provider Stack Callbacks
    ///////////////////////////////////////////////////////////////////////////

    providerOnAnnounce(nexus) {
        this.provider_state = CONNECT_STATE.CONNECTED;
        console.log("provider announce");
        if (this.onprovideronline != null) {
            this.onprovideronline();
        }
    }

    providerOnRevoke() {
        this.provider_state = CONNECT_STATE.DISCONNECTED;
        console.log("provider revoke");
        if (this.oncprovideroffline != null) {
            this.oncprovideroffline();
        }
    }

    providerOnStackEvent(layer_name, nexus, status) {
        if (this.onproviderstackevent != null) {
            this.onproviderstackevent(layer_name, status);
        }
    }

    providerHandleInvoiceRequest(msats, request_uuid) {
        console.log("provider invoice request");
    }

    providerHandlePayRequest(bolt11, request_uuid) {
        console.log("provider pay request");
    }

    handleProviderInfoRequest(shared_seed) {
        console.log("provider info request");
        var p = this.balance.getOutgoingProviderInfo();
        console.log("p: " + JSON.stringify(p));
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
        this.balance.setOutgoingWad(wad);
    }

    setNewProviderPayee(payee) {
        this.balance.setOutgoingPayee(payee);
    }

    setNewProviderPayer(payer) {
        this.balance.setOutgoingPayer(payer);
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
    // consumer beacon
    ///////////////////////////////////////////////////////////////////////////

    setEphemeralConsumerBeacon(beacon) {
        this.ephemeral_wallet_beacon = beacon;
    }

    getEphemeralConsumerBeacon() {
        return this.ephemeral_wallet_beacon;
    }

    hasStoredConsumerBeacon() {
        return window.localStorage.getItem("consumer_beacon") ? true: false;
    }

    getStoredConsumerBeacon() {
        return window.localStorage.getItem("consumer_beacon");
    }

    storeConsumerBeacon(beacon) {
        window.localStorage.setItem("consumer_beacon", beacon);
    }

    clearStoredConsumerBeacon() {
        window.localStorage.removeItem("consumer_beacon");
    }


    ///////////////////////////////////////////////////////////////////////////
    // get provider state
    ///////////////////////////////////////////////////////////////////////////

    getProviderBalanceWad() {
        return this.balance.calcOutgoingWad();
    }

    getProviderIsPayer() {
        return this.balance.calcOutgoingPayer();
    }

    getProviderIsPayee() {
        return this.balance.calcOutgoingPayee();
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
        return window.localStorage.getItem("provider_beacon") ? true: false;
    }

    getStoredProviderBeacon() {
        return window.localStorage.getItem("provider_beacon");
    }

    storeProviderBeacon(beacon) {
        window.localStorage.setItem("provider_beacon", beacon);
    }

    clearStoredProviderBeacon() {
        window.localStorage.removeItem("provider_beacon");
    }

    ///////////////////////////////////////////////////////////////////////////
    // account_uuid
    ///////////////////////////////////////////////////////////////////////////

    hasStoredAccountUuid() {
        return window.localStorage.getItem("account_uuid") ? true: false;
    }

    getStoredAccountUuid() {
        return window.localStorage.getItem("account_uuid");
    }

    storeAccountUuid(uuid) {
        window.localStorage.setItem("account_uuid", uuid);
    }

    clearStoredAccountUuid() {
        window.localStorage.removeItem("account_uuid");
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

}


exports.CostanzaModel = CostanzaModel;
exports.CONNECT_STATE = CONNECT_STATE;
