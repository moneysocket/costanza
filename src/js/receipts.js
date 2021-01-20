// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const SocketSessionReceipt = require(
    "./socket-session-receipt.js").SocketSessionReceipt;

class Receipts {
    constructor(model) {
        this.model = model;
        if (! this.hasStoredReceipts()) {
            this.store = {'receipts': []};
            this.storeReceipts();
        } else {
            this.store = this.getStoredReceipts();
        }

        console.log("receipts: " + JSON.stringify(this.store));
        this.onmodify = null;
        this.socket_session = null;

    }

    ///////////////////////////////////////////////////////////////////////////
    // modify
    ///////////////////////////////////////////////////////////////////////////

    socketSessionStart() {
        this.socket_session = SocketSessionReceipt.newSession();
        var entry = SocketSessionReceipt.sessionStartEntry();
        this.socket_session.entries.push(entry);
        this.store['receipts'].push(this.socket_session);
        this.storeReceipts();
        this.model.receiptsUpdated(this.socket_session.receipt_uuid);
    }

    socketSessionInvoiceRequest(msats, request_uuid) {
        var entry = SocketSessionReceipt.invoiceRequestEntry(msats,
                                                             request_uuid);
        this.socket_session.entries.push(entry);
        this.storeReceipts();
        this.model.receiptsUpdated(this.socket_session.receipt_uuid);
    }

    socketSessionPayRequest(bolt11, request_uuid) {
        var entry = SocketSessionReceipt.payRequestEntry(bolt11, request_uuid);
        this.socket_session.entries.push(entry);
        this.storeReceipts();
        this.model.receiptsUpdated(this.socket_session.receipt_uuid);
    }

    socketSessionPreimageNotified(preimage, increment, msats,
                                  request_reference_uuid)
    {
        var entry = SocketSessionReceipt.preimageNotifiedEntry(preimage,
            increment, msats, request_reference_uuid);
        this.socket_session.entries.push(entry);
        this.storeReceipts();
        this.model.receiptsUpdated(this.socket_session.receipt_uuid);
    }

    socketSessionInvoiceNotified(bolt11, request_reference_uuid) {
        var entry = SocketSessionReceipt.invoiceNotifiedEntry(bolt11,
            request_reference_uuid);
        this.socket_session.entries.push(entry);
        this.storeReceipts();
        this.model.receiptsUpdated(this.socket_session.receipt_uuid);
    }

    socketSessionErrorNotified(err) {
        var entry = SocketSessionReceipt.errNotifiedEntry(err);
        this.socket_session.entries.push(entry);
        this.storeReceipts();
        this.model.receiptsUpdated(this.socket_session.receipt_uuid);
    }

    socketSessionEnd() {
        var entry = SocketSessionReceipt.sessionEndEntry();
        this.socket_session.entries.push(entry);
        this.storeReceipts();
        this.model.receiptsUpdated(this.socket_session.receipt_uuid);
        this.socket_session = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // localStorage
    ///////////////////////////////////////////////////////////////////////////

    hasStoredReceipts() {
        return window.localStorage.getItem("receipts") ? true: false;
    }

    getStoredReceipts() {
        return JSON.parse(window.localStorage.getItem("receipts"));
    }

    storeReceipts() {
        window.localStorage.setItem("receipts", JSON.stringify(this.store));
    }

    clearStoredReceipts() {
        window.localStorage.removeItem("receipts");
    }

    ///////////////////////////////////////////////////////////////////////////
    // accessors
    ///////////////////////////////////////////////////////////////////////////

    getReceiptDict() {
        return this.store.receipts;
    }
}


exports.Receipts = Receipts;
