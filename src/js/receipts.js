// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const SocketSessionReceipt = require(
    "./socket-session-receipt.js").SocketSessionReceipt;
const ManualReceiveReceipt = require(
    "./manual-receive-receipt.js").ManualReceiveReceipt;
const ManualSendReceipt = require(
    "./manual-send-receipt.js").ManualSendReceipt;

const b11 = require("bolt11");
const Bolt11 = require("moneysocket").Bolt11;

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
        this.receive_requests = {};
        this.send_requests = {};
        this.uuid_by_payment_hash = {};
    }

    ///////////////////////////////////////////////////////////////////////////
    // socket session
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
    // manual receive
    ///////////////////////////////////////////////////////////////////////////

    manualReceiveStart(msats, request_uuid) {
        var receive = ManualReceiveReceipt.newManualReceive();
        var entry = ManualReceiveReceipt.manualReceiveRequestInvoiceEntry(
            msats, request_uuid);
        receive.entries.push(entry);
        this.receive_requests[request_uuid] = receive;
        this.store['receipts'].push(receive);
        this.storeReceipts();
        this.model.receiptsUpdated(request_uuid);
    }

    manualReceiveGotInvoice(bolt11, request_reference_uuid) {
        var payment_hash = Bolt11.getPaymentHash(bolt11);
        var expiry_timestamp = this.getExpiryTimestamp(bolt11);
        this.uuid_by_payment_hash[payment_hash] = request_reference_uuid;
        var entry = ManualReceiveReceipt.manualReceiveGotInvoiceEntry(
            bolt11, request_reference_uuid, expiry_timestamp, payment_hash);
        var receive = this.receive_requests[request_reference_uuid];
        receive.entries.push(entry);
        this.storeReceipts();
        this.model.receiptsUpdated(receive.receipt_uuid);
    }

    manualReceivePaid(preimage) {
        var payment_hash = Bolt11.preimageToPaymentHash(preimage);
        var request_reference_uuid = this.uuid_by_payment_hash[payment_hash];
        delete this.uuid_by_payment_hash[payment_hash];
        var entry = ManualReceiveReceipt.manualReceiveGotPreimageEntry(
            preimage, payment_hash, request_reference_uuid);
        var receive = this.receive_requests[request_reference_uuid];
        delete this.receive_requests[request_reference_uuid];
        receive.entries.push(entry);
        this.storeReceipts();
        this.model.receiptsUpdated(receive.receipt_uuid);
    }

    manualReceiveTimeout() {
        // TODO
    }

    ///////////////////////////////////////////////////////////////////////////
    // manual receive
    ///////////////////////////////////////////////////////////////////////////

    manualSendStart(bolt11, request_uuid) {
        var send = ManualSendReceipt.newManualSend();
        var payment_hash = Bolt11.getPaymentHash(bolt11);
        var msats = this.getMsats(bolt11);
        var description = this.getDescription(bolt11);
        this.uuid_by_payment_hash[payment_hash] = request_uuid;
        var entry = ManualSendReceipt.manualSendRequestSendEntry(
            bolt11, msats, description, request_uuid);
        send.entries.push(entry);
        this.send_requests[request_uuid] = send;
        this.store['receipts'].push(send);
        this.storeReceipts();
        this.model.receiptsUpdated(send.receipt_uuid);
    }

    manualSendGotPreimage(preimage) {
        var payment_hash = Bolt11.preimageToPaymentHash(preimage);
        var request_reference_uuid = this.uuid_by_payment_hash[payment_hash];
        delete this.uuid_by_payment_hash[payment_hash];
        var send = this.send_requests[request_reference_uuid];
        delete this.send_requests[request_reference_uuid];
        var entry = ManualSendReceipt.manualSendGotPreimageEntry(
            preimage, payment_hash, request_reference_uuid);
        send.entries.push(entry);
        this.storeReceipts();
        this.model.receiptsUpdated(send.receipt_uuid);
    }

    manualSendTimeout() {
        // TODO
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

    ///////////////////////////////////////////////////////////////////////////
    // misc
    ///////////////////////////////////////////////////////////////////////////

    getExpiryTimestamp(bolt11) {
        // TODO - move this to library
        var decoded = b11.decode(bolt11);
        var timestamp = decoded.timestamp;
        var expire_time = decoded.expire_time;
        console.log("get expiry timestamp: " + decoded + " " +
                    timestamp + " " + expire_time);
        return timestamp + expire_time;
    }

    getDescription(bolt11) {
        // TODO - move this to library
        var decoded = b11.decode(bolt11);
        for (var i = 0; i < decoded.tags.length; i++) {
            if (decoded.tags[i]["tagName"] == "description") {
                return decoded.tags[i]["data"];
            }
        }
        return null;
    }

    getMsats(bolt11) {
        // TODO move this to library and do fuller validation
        var decoded = b11.decode(bolt11);
        if ("millisatoshis" in decoded) {
            return decoded.millisatoshis;
        }
        return null;
    }
}


exports.Receipts = Receipts;
