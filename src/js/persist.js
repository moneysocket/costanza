// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const PERSIST_PROFILE = {
    ONE:   'PROFILE_ONE',
    TWO:   'PROFILE_TWO',
    THREE: 'PROFILE_THREE',
}

const DEFAULT_CHECKOUT = {
    "PROFILE_ONE": false,
    "PROFILE_TWO": false,
    "PROFILE_THREE": false,
}


class Persist {
    constructor() {
        this.initProfileCheckoutIfNotAlready();
        this.profile = this.chooseProfile();
        console.log("chose profile: " + this.profile);
    }

    ///////////////////////////////////////////////////////////////////////////
    // profile checkouts
    ///////////////////////////////////////////////////////////////////////////

    switchToProfile(profile) {
        var record = this.getProfileCheckoutRecord();
        record[this.profile] = false;;
        record[profile] = true;;
        this.profile = profile;
        this.setProfileCheckoutRecord(record);
    }

    clearProfile(profile) {
        console.log("clearing: " + profile);
        this.removeProfileItem("consumer_beacon", profile);
        this.removeProfileItem("provider_beacon", profile);
        this.removeProfileItem("account_uuid", profile);
        this.removeProfileItem("receipts", profile);
    }

    chooseProfile() {
        var record = this.getProfileCheckoutRecord();
        if (! record[PERSIST_PROFILE.ONE]) {
            record[PERSIST_PROFILE.ONE] = true;
            //console.log("record: " + JSON.stringify(record));
            this.setProfileCheckoutRecord(record);
            return PERSIST_PROFILE.ONE;
        } else if (! record[PERSIST_PROFILE.TWO]) {
            record[PERSIST_PROFILE.TWO] = true;
            this.setProfileCheckoutRecord(record);
            return PERSIST_PROFILE.TWO;
        } else if (! record[PERSIST_PROFILE.THREE]) {
            record[PERSIST_PROFILE.THREE] = true;
            this.setProfileCheckoutRecord(record);
            return PERSIST_PROFILE.THREE;
        }
        console.log("unable to find unused profile, using: " +
                    PERSIST_PROFILE.THREE);
        record[PERSIST_PROFILE.THREE] = true;
        this.setProfileCheckoutRecord(record);
        return PERSIST_PROFILE.THREE;
    }

    yieldCheckedOutProfile() {
        var record = this.getProfileCheckoutRecord();
        record[this.profile] = false;;
        this.setProfileCheckoutRecord(record);
    }

    hasProfileCheckoutRecord() {
        return window.localStorage.getItem("profile_checkout") ? true: false;
    }

    initProfileCheckoutRecord() {
        window.localStorage.setItem("profile_checkout",
                                    JSON.stringify(DEFAULT_CHECKOUT));
    }

    setProfileCheckoutRecord(record) {
        //console.log("setting: " + JSON.stringify(record));
        window.localStorage.setItem("profile_checkout",
                                    JSON.stringify(record));
    }

    getProfileCheckoutRecord() {
        return JSON.parse(window.localStorage.getItem("profile_checkout"))
    }

    initProfileCheckoutIfNotAlready() {
        if (! this.hasProfileCheckoutRecord()) {
            this.initProfileCheckoutRecord();
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // calls for UI
    ///////////////////////////////////////////////////////////////////////////

    getStorageSettings() {
        var record = this.getProfileCheckoutRecord();
        return [this.profile, record];
    }

    ///////////////////////////////////////////////////////////////////////////
    // helpers
    ///////////////////////////////////////////////////////////////////////////

    setItem(tag, val) {
        window.localStorage.setItem(this.profile + "_" + tag, val);
    }

    getItem(tag) {
        return window.localStorage.getItem(this.profile + "_" + tag);
    }

    hasItem(tag) {
        return window.localStorage.getItem(this.profile + "_" + tag) ? true:
                                                                       false;
    }

    removeItem(tag) {
        window.localStorage.removeItem(this.profile + "_" + tag);
    }

    removeProfileItem(tag, profile) {
        window.localStorage.removeItem(profile + "_" + tag);
    }

    ///////////////////////////////////////////////////////////////////////////
    // consumer beacon
    ///////////////////////////////////////////////////////////////////////////

    hasStoredConsumerBeacon() {
        return this.hasItem("consumer_beacon");
    }

    getStoredConsumerBeacon() {
        return this.getItem("consumer_beacon");
    }

    storeConsumerBeacon(beacon) {
        this.setItem("consumer_beacon", beacon);
    }

    clearStoredConsumerBeacon() {
        this.removeItem("consumer_beacon");
    }

    ///////////////////////////////////////////////////////////////////////////
    // provider beacon
    ///////////////////////////////////////////////////////////////////////////

    hasStoredProviderBeacon() {
        return this.hasItem("provider_beacon");
    }

    getStoredProviderBeacon() {
        return this.getItem("provider_beacon");
    }

    storeProviderBeacon(beacon) {
        this.setItem("provider_beacon", beacon);
    }

    clearStoredProviderBeacon() {
        this.removeItem("provider_beacon");
    }

    ///////////////////////////////////////////////////////////////////////////
    // account_uuid
    ///////////////////////////////////////////////////////////////////////////

    hasStoredAccountUuid() {
        return this.hasItem("account_uuid");
    }

    getStoredAccountUuid() {
        return this.getItem("account_uuid");
    }

    storeAccountUuid(uuid) {
        this.setItem("account_uuid", uuid);
    }

    clearStoredAccountUuid() {
        this.removeItem("account_uuid");
    }

    ///////////////////////////////////////////////////////////////////////////
    // receipts
    ///////////////////////////////////////////////////////////////////////////

    hasStoredReceipts() {
        return this.hasItem("receipts");
    }

    getStoredReceipts() {
        console.log("r: " + this.getItem("receipts"));
        return JSON.parse(this.getItem("receipts"));
    }

    storeReceipts(receipts) {
        console.log("set item storing: " + JSON.stringify(receipts));
        this.setItem("receipts", JSON.stringify(receipts));
    }

    clearStoredReceipts() {
        this.removeItem("receipts");
    }

}

exports.PERSIST_PROFILE = PERSIST_PROFILE;
exports.Persist = Persist;
