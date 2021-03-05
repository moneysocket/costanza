// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const b11 = require("bolt11");
const Bolt11 = require("moneysocket").Bolt11;
const Timestamp = require("moneysocket").Timestamp;


class Transact {
    constructor(model) {
        this.model = model;
        this.balance = this.model.balance;
        this.invoices_requested_socket = {};
        this.invoices_requested_manual = {};

        this.invoices_provided_socket = {};
        this.invoices_provided_manual = {};

        this.pays_requested_socket = {};
        this.pays_requested_manual = {};
        this.pays_requested_socket_by_request_uuid = {};
        this.pays_requested_manual_by_request_uuid = {};
    }

    //////////////////////////////////////////////////////////////////////////
    // sum amounts
    //////////////////////////////////////////////////////////////////////////

    receiveAmountsPending() {
        var total_msats = 0;
        for (var key in this.invoices_requested_socket) {
            var msats = this.invoices_requested_socket[key];
            total_msats += msats;
        }
        for (var key in this.invoices_requested_manual) {
            var msats = this.invoices_requested_manual[key];
            total_msats += msats;
        }

        for (var key in this.invoices_provided_socket) {
            var msats = this.invoices_provided_socket[key]['msats'];
            total_msats += msats;
        }
        for (var key in this.invoices_provided_manual) {
            var msats = this.invoices_provided_manual[key]['msats'];
            total_msats += msats;
        }
        return total_msats;
    }

    sendAmountsPending() {
        var total_msats = 0;
        for (var key in this.pays_requested_socket) {
            var msats = this.pays_requested_socket[key]['msats'];
            total_msats += msats;
        }
        for (var key in this.pays_requested_manual) {
            var msats = this.pays_requested_manual[key]['msats'];
            total_msats += msats;
        }
        return total_msats;
    }

    //////////////////////////////////////////////////////////////////////////
    // prune expired
    //////////////////////////////////////////////////////////////////////////

    pruneExpired() {
        var now = Timestamp.getNowTimestamp();
        var expired = now + 30; // 30 seconds leeway for drift

        for (var key in this.pays_requested_socket) {
            if (this.pays_requested_socket[key]['expiry'] > expired) {
                delete this.pays_requested_socket[key];
            }
        }
        for (var key in this.pays_requested_manual) {
            if (this.pays_requested_manual[key]['expiry'] > expired) {
                delete this.pays_requested_manual[key];
            }
        }
        for (var key in this.invoices_provided_socket) {
            if (this.invoices_provided_socket[key]['expiry'] > expired) {
                delete this.invoices_provided_socket[key];
            }
        }
        for (var key in this.invoices_provided_socket) {
            if (this.invoices_provided_socket[key]['expiry'] > expired) {
                delete this.invoices_provided_socket[key];
            }
        }
    }

    //////////////////////////////////////////////////////////////////////////
    // consumer notifications
    //////////////////////////////////////////////////////////////////////////

    preimageNotified(preimage) {
        var payment_hash = Bolt11.preimageToPaymentHash(preimage);
        // we got paid
        if (payment_hash in this.invoices_provided_socket) {
            var msats = this.invoices_provided_socket[payment_hash]['msats'];
            delete this.invoices_provided_socket[payment_hash];
            return [true, true, msats];
        }
        if (payment_hash in this.invoices_provided_manual) {
            var msats = this.invoices_provided_manual[payment_hash]['msats'];
            delete this.invoices_provided_manual[payment_hash];
            return [false, true, msats];
        }
        // we paid someone
        if (payment_hash in this.pays_requested_socket) {
            var msats = this.pays_requested_socket[payment_hash]['msats'];
            delete this.pays_requested_socket[payment_hash];
            return [true, false, msats];
        }
        if (payment_hash in this.pays_requested_manual) {
            var msats = this.pays_requested_manual[payment_hash]['msats'];
            delete this.pays_requested_manual[payment_hash];
            return [false, false, msats];
        }
        return [null, null, null];
    }

    isSocketRequest(request_reference_uuid) {
        return request_reference_uuid in this.invoices_requested_socket;
    }

    isManualRequest(request_reference_uuid) {
        return request_reference_uuid in this.invoices_requested_manual;
    }

    forgetRequest(request_reference_uuid) {
        if (this.isSocketRequest(request_reference_uuid)) {
            delete this.invoices_requested_socket[request_reference_uuid];
        }
        if (this.isManualRequest(request_reference_uuid)) {
            delete this.invoices_requested_manual[request_reference_uuid];
        }
        if (request_reference_uuid in
            this.pays_requested_socket_by_request_uuid)
        {
            var payment_hash = this.pays_requested_socket_by_request_uuid;
            delete this.pays_requested_socket[payment_hash];
            delete this.pays_requested_socket_by_request_uuid[
                request_reference_uuid];
        }
        if (request_reference_uuid in
            this.pays_requested_manual_by_request_uuid)
        {
            var payment_hash = this.pays_requested_manual_by_request_uuid;
            delete this.pays_requested_manual[payment_hash];
            delete this.pays_requested_manual_by_request_uuid[
                request_reference_uuid];
        }
    }


    invoiceNotified(bolt11, request_reference_uuid) {
        var payment_hash = Bolt11.getPaymentHash(bolt11);
        var invoice_msats = this.getMsats(bolt11);
        if (invoice_msats == null) {
            var socket = this.isSocketRequest(request_reference_uuid);
            this.forgetRequest(request_reference_uuid);
            return [socket, "no amount in invoice"];
        }
        if (payment_hash in this.invoices_provided_socket) {
            var socket = this.isSocketRequest(request_reference_uuid);
            this.forgetRequest(request_reference_uuid);
            return [socket, "duplicate payment_hash"];
        }
        if (payment_hash in this.invoices_provided_manual) {
            var socket = this.isSocketRequest(request_reference_uuid);
            this.forgetRequest(request_reference_uuid);
            return [socket, "duplicate payment_hash"];
        }
        if (request_reference_uuid in this.invoices_requested_socket) {
            var msats = this.invoices_requested_socket[request_reference_uuid];
            var expiry = this.getExpiryTimestamp(bolt11);
            this.forgetRequest(request_reference_uuid);
            if (msats != invoice_msats) {
                return [true, "wrong msat amount in invoice"];
            }
            this.invoices_provided_socket[payment_hash] = {'bolt11': bolt11,
                                                           'msats':  msats,
                                                           'expiry': expiry}
            return [true, null];
        }
        if (request_reference_uuid in this.invoices_requested_manual) {
            var msats = this.invoices_requested_manual[request_reference_uuid];
            var expiry = this.getExpiryTimestamp(bolt11);
            this.forgetRequest(request_reference_uuid);
            if (msats != invoice_msats) {
                return [false, "wrong msat amount in invoice"];
            }
            this.invoices_provided_manual[payment_hash] = {'bolt11': bolt11,
                                                           'msats':  msats,
                                                           'expiry': expiry}
            return [false, null];
        }
        return [false, "unknown request_reference_uuid"];
    }

    errorNotified(request_reference_uuid) {
        if (request_reference_uuid in this.invoices_requested_socket) {
            this.forgetRequest(request_reference_uuid);
            return [true, true, false];
        }
        else if (request_reference_uuid in this.invoices_requested_manual) {
            this.forgetRequest(request_reference_uuid);
            return [true, false, false];
        }
        else if (request_reference_uuid in
                 this.pays_requested_socket_by_request_uuid)
        {
            this.forgetRequest(request_reference_uuid);
            return [true, true, true];
        }
        else if (request_reference_uuid in
                 this.pays_requested_manual_by_request_uuid)
        {
            this.forgetRequest(request_reference_uuid);
            return [true, false, true];
        }
        return [false, null, null]
    }

    //////////////////////////////////////////////////////////////////////////
    // pay requests socket
    //////////////////////////////////////////////////////////////////////////

    checkPayRequestSocket(bolt11) {
        if (! this.balance.calcSocketPayer()) {
            return "send not authorized";
        }
        var msats = this.getMsats(bolt11);
        if (msats == null) {
            return "amount not included in invoice";
        }
        var payment_hash = Bolt11.getPaymentHash(bolt11);
        if (payment_hash in this.pays_requested_socket) {
            return "duplicate payment_hash";
        }
        if (payment_hash in this.pays_requested_manual) {
            return "duplicate payment_hash";
        }
        var wad = this.balance.calcSocketWad();
        var authorized = wad.msats;
        var pending_out = this.sendAmountsPending();
        if (msats > (authorized - pending_out)) {
            return "insufficient balance";
        }
        return null;
    }

    payRequestedSocket(bolt11, request_uuid) {
        var payment_hash = Bolt11.getPaymentHash(bolt11);
        var msats = this.getMsats(bolt11);
        var expiry = this.getExpiryTimestamp(bolt11);
        this.pays_requested_socket[payment_hash] = {
            'bolt11':       bolt11,
            'msats':        msats,
            'expiry':       expiry,
            'request_uuid': request_uuid};
        this.pays_requested_socket_by_request_uuid[request_uuid] = payment_hash;
    }

    //////////////////////////////////////////////////////////////////////////
    // pay requests manual
    //////////////////////////////////////////////////////////////////////////

    checkPayRequestManual(bolt11) {
        if (! this.balance.incoming_payer) {
            return "send not authorized";
        }
        var msats = this.getMsats(bolt11);
        if (msats == null) {
            return "amount not included in invoice";
        }
        if (! this.balance.hasManualBalanceAvailable(msats)) {
            return "insufficient balance";
        }
        var payment_hash = Bolt11.getPaymentHash(bolt11);
        if (payment_hash in this.pays_requested_socket) {
            return "duplicate payment_hash";
        }
        if (payment_hash in this.pays_requested_manual) {
            return "duplicate payment_hash";
        }
        return null;
    }

    payRequestedManual(bolt11, request_uuid) {
        var payment_hash = Bolt11.getPaymentHash(bolt11);
        var msats = this.getMsats(bolt11);
        var expiry = this.getExpiryTimestamp(bolt11);
        this.pays_requested_manual[payment_hash] = {
            'bolt11':       bolt11,
            'msats':        msats,
            'expiry':       expiry,
            'request_uuid': request_uuid};
        this.pays_requested_manual_by_request_uuid[request_uuid] = payment_hash;
    }

    //////////////////////////////////////////////////////////////////////////
    // socket invoice requests
    //////////////////////////////////////////////////////////////////////////

    checkInvoiceRequestSocket(msats) {
        if (! this.balance.calcSocketPayee()) {
            return "receive not authorized";
        }
        return null;
    }

    invoiceRequestedSocket(msats, request_uuid) {
        this.invoices_requested_socket[request_uuid] = msats;
    }

    //////////////////////////////////////////////////////////////////////////
    // manual invoice requests
    //////////////////////////////////////////////////////////////////////////

    checkInvoiceRequestManual(msats) {
        if (! this.balance.incoming_payee) {
            return "receive not authorized";
        }
        return null;
    }

    invoiceRequestedManual(msats, request_uuid) {
        this.invoices_requested_manual[request_uuid] = msats;
    }

    //////////////////////////////////////////////////////////////////////////
    // misc
    //////////////////////////////////////////////////////////////////////////

    getExpiryTimestamp(bolt11) {
        // TODO - move this to library
        var decoded = b11.decode(bolt11);
        var timestamp = decoded.timestamp;
        var expire_time = decoded.expire_time;
        console.log("get expiry timestamp: " + decoded + " " +
                    timestamp + " " + expire_time);
        return timestamp + expire_time;
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

exports.Transact = Transact;
