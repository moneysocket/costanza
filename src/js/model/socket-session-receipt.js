// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const Uuid = require("moneysocket").Uuid;
const Timestamp = require("moneysocket").Timestamp;
const Wad = require("moneysocket").Wad;

class SocketSessionReceipt {
    //////////////////////////////////////////////////////////////////////////
    // session lifecycle
    //////////////////////////////////////////////////////////////////////////

    static newSession() {
        var uuid = Uuid.uuidv4();
        var time = Timestamp.getNowTimestamp();
        var session = {'type':         'socket_session',
                       'receipt_uuid': uuid,
                       'time':         time,
                       'entries':      [],
                      };
        return session;
    }

    static sessionStartEntry() {
        var entry = {'type': 'session_start',
                     'time':  Timestamp.getNowTimestamp(),
                    };
        return entry;
    }

    static invoiceRequestEntry(wad, request_uuid) {
        var entry = {'type':         'invoice_request',
                     'time':         Timestamp.getNowTimestamp(),
                     'wad':          wad,
                     'request_uuid': request_uuid,
                    };
        return entry;
    }

    static payRequestEntry(bolt11, wad, request_uuid) {
        var entry = {'type':         'pay_request',
                     'time':         Timestamp.getNowTimestamp(),
                     'wad':          wad,
                     'bolt11':       bolt11,
                     'request_uuid': request_uuid,
                    };
        return entry;
    }

    static preimageNotifiedEntry(preimage, increment, wad,
                                 request_reference_uuid)
    {
        var entry = {'type':                   'preimage_notified',
                     'time':                   Timestamp.getNowTimestamp(),
                     'preimage':               preimage,
                     'increment':              increment,
                     'wad':                    wad,
                     'request_reference_uuid': request_reference_uuid,
                    };
        return entry;
    }

    static invoiceNotifiedEntry(bolt11, request_reference_uuid) {
        var entry = {'type':                   'invoice_notified',
                     'time':                   Timestamp.getNowTimestamp(),
                     'bolt11':                 bolt11,
                     'request_reference_uuid': request_reference_uuid,
                    };
        return entry;
    }

    static errNotifiedEntry(err) {
        var entry = {'type':  'error_notified',
                     'time':  Timestamp.getNowTimestamp(),
                     'error': err,
                    };
        return entry;
    }

    static sessionEndEntry() {
        var entry = {'type': 'session_end',
                     'time':  Timestamp.getNowTimestamp(),
                    };
        return entry;
    }

    //////////////////////////////////////////////////////////////////////////
    // session info calcluation
    //////////////////////////////////////////////////////////////////////////

    static isSessionEnded(session) {
        console.assert(session['type'] == "socket_session")
        var entries = session['entries']
        return entries[entries.length - 1]['type'] == 'session_end';
    }

    static sessionSettledInfo(session) {
        var entries = session['entries'];
        var total_msats = 0;
        var total_txs = 0;
        var first_wad = null;
        var increment;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i]['type'] == 'preimage_notified') {
                if (first_wad == null) {
                    first_wad = entries[i]['wad'];
                }
                if (entries[i]['increment']) {
                    total_msats += entries[i]['wad']['msats'];
                } else {
                    total_msats -= entries[i]['wad']['msats'];
                }
                total_txs++;
            }
        }
        increment = total_msats >= 0;
        if (! increment) {
            total_msats = 0 - total_msats;
        }
        var wad = (first_wad == null) ?
            Wad.bitcoin(total_msats) :
            Wad.clone_msats(first_wad, total_msats);
        return [wad, increment, total_txs];
    }
}


exports.SocketSessionReceipt = SocketSessionReceipt;
