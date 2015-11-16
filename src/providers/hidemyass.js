'use strict';

const phantom = require('phantom');
const Gateway = require('../gateway/Gateway');

const URL = 'http://proxylist.hidemyass.com/search-1292985#listable';

module.exports = {
    crawl: callback => {
        phantom.create(ph => {
            ph.createPage(page => {
                page.open(URL, status => {
                    console.log(`Opened page ${URL} with ${status}`);
                    
                    page.evaluate(
                        /* It runs on the virtual browser, so we cant use ES6 */
                        function () {
                            var gtws = [];
                            var table = $('table#listable tbody');
                            if (table) {

                                var rows = table.find('tr');
                                rows.each(function (index, tr) {

                                    var gateway = {};
                                    var cols = $(tr).find('td');
                                    cols.each(function (index, col) {

                                        col = $(col);
                                        switch (col.index()) {
                                            case 1:
                                                gateway.hostname = col[0].innerText.trim();
                                                break;
                                            case 2:
                                                gateway.port = col[0].innerText.trim();
                                                break;
                                            case 3:
                                                gateway.country = col[0].innerText.trim();
                                                break;
                                            case 6:
                                                gateway.protocol = col[0].innerText.trim().toLowerCase();
                                                break;
                                            case 7:
                                                gateway.anonymity = col[0].innerText.trim();
                                                break;
                                        }

                                        gtws.push(gateway);
                                    });
                                });
                            }

                            return gtws;
                        }
                        /* XXX */
                        , gateways => {
                            gateways = gateways
                                .filter(n => {
                                    return !!n
                                        && !!n.hostname
                                        && !!n.port
                                        && !!n.protocol;
                                })
                                .map(gtw => {
                                    let g = new Gateway(gtw);
                                    g.provider = 'HideMyAss';
                                    return g;
                                });
                            
                            callback(gateways);

                            ph.exit();
                        }
                    );
                });
            });
        });
    }
};