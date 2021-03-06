/*
 * Copyright (c) 2011-2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var Stream = require('stream');

function Scraper(mojito) {
    this.mojito = mojito;
    this.server = null;
}

Scraper.prototype = Object.create(Stream.prototype);

Scraper.prototype.start = function start(opts) {
    this.server = this.mojito.createServer(opts);
    return this;
};

Scraper.prototype.fetch = function fetch(buildmap, cb) {
    var me = this;

    this.server.listen(null, null, function (err) {
        var keys = Object.keys(buildmap),
            have = 0,
            failed = 0,
            need = keys.length,
            opts = {headers: {'x-mojito-build': 'html5app'}};

        if (err) {
            me.emit('error', err);
            return cb('Failed to start server.');
        }

        keys.forEach(function (key) {
            me.server.getWebPage(key, opts, function (err, uri, content) {
                if (err) {
                    failed += 1;
                    me.emit('warn', 'FAILED to get ' + uri);
                } else {
                    me.emit('scraped-one', buildmap[uri], content);
                }

                have += 1;
                if (have === need) {
                    me.server.close();
                    me.emit('scraping-done', null, have, failed);
                }
            });
        });
    });
};

module.exports = Scraper;
