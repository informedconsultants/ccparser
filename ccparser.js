/**
 * Simple credit card parser - demo, NOT for production use
 * Regex functions as used should never be used in production
 */

/*jslint nomen: true*/



/*
    @class CreditCard
 */

function CreditCard(track_data) {
    this.fields = ['format_code', 'number', 'expiration', 'last_name',
        'first_name', 'service_code'];
    this.track_data = track_data;
    this.CENTURY = "20";
    this._parse();
}

/*
    Credit card parsing exceptions
    @class CCException
 */
function CCException(name, message) {
    this.name = name;
    this.message = message;
    this.toString = function () {
        return this.name + ": " + this.message;
    };
}

(function () {
    "use strict";

    function CCErrors() {
        this.errors = {};
    }

    CCErrors.prototype = {
        _add : function (field, message) {
            if (this.errors[field] === undefined) {
                this.errors[field] = [];
            }
            this.errors[field].push(message);
        },

        messages : function () {
            return this.errors;
        }
    };



    CreditCard.prototype._parseTracks = function () {
        this.tracks = this.track_data.match(/^%(.*)\?;(.*)\?/);
        if (this.tracks === null) {
            throw new CCException("CCException",
                "Track data does not match expected credit card format");
        }
    };

    CreditCard.prototype._parseTrack1 = function () {
        var track1_raw = this.tracks[1];
        var track1_data =
            track1_raw.match(/^(.)(\d*)\^([^\/]*)\/(.*)\^(.{4})(.{3})(.*)$/);
        if (track1_data === null) {
            throw new CCException("CCException",
                "Could not parse track 1 data");
        }
        this.track1 = {
            raw : track1_raw,
            match_data : track1_data,
            format_code : track1_data[1],
            number : track1_data[2],
            last_name : track1_data[3],
            first_name : track1_data[4],
            expiration : track1_data[5],
            service_code : track1_data[6],
            discretionary : track1_data[7]
        };
        this.format_code = this.track1.format_code;
        this.last_name = this.track1.last_name;
        this.first_name = this.track1.first_name;
    };

    CreditCard.prototype._parseTrack2 = function () {
        var track2_raw = this.tracks[2];

        var track2_data = track2_raw.match(/^(\d*)=(.{4})(.{3})(.*)$/);
        if (track2_data === null) {
            throw new CCException("CCException",
                "Could not parse track 2 data");
        }
        this.track2 = {
            raw : track2_raw,
            match_data : track2_data,
            number : track2_data[1],
            expiration : track2_data[2],
            service_code : track2_data[3],
            discretionary : track2_data[4]
        };

        this.number = this.track2.number;
        this.expiration = this.track2.expiration;
        this.service_code = this.track2.service_code;
    };

    CreditCard.prototype._parse = function () {
        this._parseTracks();
        this._parseTrack1();
        this._parseTrack2();
    };

    CreditCard.prototype.year = function () {
        if (this.expiration) {
            return this.CENTURY + this.expiration.slice(0, 2);
        }
    };

    CreditCard.prototype.month = function () {
        if (this.expiration) {
            return this.expiration.slice(2, 4);
        }
    };

    CreditCard.prototype.isValid = function () {
        this.errors = new CCErrors();
        var i;
        for (i = 0; i < this.fields.length; i += 1) {
            var field = this.fields[i];
            if (!this[field]) {
                this.errors._add(field, 'was not found');
            }
        }
        if (this.track1.raw && this.track2.raw
                && !this.errors.number
                && !this.errors.expiration) {
            return true;
        }
        return false;
    };

}());
