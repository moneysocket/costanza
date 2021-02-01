// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const Uuid = require("moneysocket").Uuid;
const Timestamp = require("moneysocket").Timestamp;


class ManualSendReceipt {
    static newManualSend() {
        var uuid = Uuid.uuidv4();
        var time = Timestamp.getNowTimestamp();
        var send = {'type':         'manual_send',
                    'receipt_uuid': uuid,
                    'time':         time,
                    'entries':      [],
                   };
        return send;
    }

    static manualSendRequestSendEntry(bolt11, msats, description,
                                      request_uuid)
    {
        var entry = {'type':         'request_pay',
                     'time':         Timestamp.getNowTimestamp(),
                     'bolt11':       bolt11,
                     'msats':        msats,
                     'description':  description,
                     'request_uuid': request_uuid,
                    };
        return entry;
    }

    static manualSendGotPreimageEntry(preimage, payment_hash,
                                      request_reference_uuid)
    {
        // TODO routing fee
        var entry = {'type':                   'got_preimage',
                     'time':                   Timestamp.getNowTimestamp(),
                     'preimage':               preimage,
                     'payment_hash':           payment_hash,
                     'request_reference_uuid': request_reference_uuid,
                    };
        return entry;
    }

    static manualSendInfo(manual_send) {
        //console.log("manual_send: " + JSON.stringify(manual_send));
        var entries = manual_send['entries']
        var completed = ((entries.length == 2) &&
                         entries[1]['type'] == 'got_preimage');

        var bolt11 = entries[0]['bolt11'];
        var msats = entries[0]['msats'];
        var description = entries[0]['description'];
        return [completed, bolt11, msats, description];
    }
}

exports.ManualSendReceipt = ManualSendReceipt;
