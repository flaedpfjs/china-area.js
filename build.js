"use strict";

const fs          = require('fs'),
      path        = require('path'),
      jsdom       = require('jsdom'),
      yargs       = require('yargs');

var argv = yargs
    .usage('build china-area.js.\nUsage: $0')
    .describe('output', 'Output file, output json if ends with .json')
    .string('output')
    .default('output', __dirname + '/china-area.js')
    .help('h')
    .alias('h', 'help')
    .argv;


function getDataURL (callback) {
    const url = "http://www.stats.gov.cn/tjsj/tjbz/xzqhdm/";
    console.info("get " + url + " ...");
    jsdom.env(
        url,
        ["http://code.jquery.com/jquery.js"],
        function (err, window) {
            if (err) {
                return callback(err);
            }

            let latest_url = null;
            try {
                latest_url =  window.$('ul.center_list_contlist > li > a')[0].href;
            } catch (err) {
                if (err) {
                    return callback(err);
                }
            }

            return callback(null, latest_url);
        });
}

function parseData (url, callback) {
    console.info("get " + url + " ...");
    jsdom.env(
        url,
        ["http://code.jquery.com/jquery.js"],
        function (err, window) {
            if (err) {
                return callback(err);
            }

            let provinces = [];
            let cities = [];
            let counties = [];
            const spans = window.$("div.TRS_PreAppend > p.MsoNormal > span");
            for(let i = 0; i < spans.length/2; ++i) {
                const code = spans.eq(i*2+0).text().trim();
                const name = spans.eq(i*2+1).text().trim();
                if (code.substr(2) == '0000') {
                    provinces.push(name);
                } else if (code.substr(4, 2) == '00') {
                    if (! cities[provinces.length - 1]) {
                        cities[provinces.length - 1] = [];
                    }
                    cities[provinces.length - 1].push(name);
                } else if (code) {
                    if (! counties[provinces.length - 1]) {
                        counties[provinces.length - 1] = [];
                    }
                    if (! counties[provinces.length - 1][cities[provinces.length - 1].length - 1]) {
                        counties[provinces.length - 1][cities[provinces.length - 1].length - 1] = [];
                    }
                    counties[provinces.length - 1][cities[provinces.length - 1].length - 1].push(name);
                }
            }

            return callback(null, [provinces, cities, counties]);
        });
}

function renderData(data, output, callback) {
    let extname = path.extname(output);
    if (extname == '.json') {
        renderJSON();
    } else if (extname == '.js') {
        renderJS();
    } else {
        return callback(new Error('Unexpected output file format'));
    }

    function renderJSON () {
        fs.writeFile(output, JSON.stringify(data), callback);
    }

    function renderJS () {
        const json_data = JSON.stringify(data, null, '\t');
        fs.writeFile(output, `"use strict";

function chinaAreaInit(selects, defaults) {
    var data = ${json_data};
    function refresh (index) {
        selects[index].length = 0;
        selects[index].options[0] = new Option(defaults[index], '');
        var values = [];
        switch(index) {
        case 0:
            values = data[index] || [];
            break;
        case 1:
            if (selects[0].selectedIndex > 0) {
                values = data[index][selects[0].selectedIndex - 1] || [];
            }
            break;
        case 2:
            if (selects[0].selectedIndex > 0 && selects[1].selectedIndex > 0) {
                values = data[index][selects[0].selectedIndex - 1][selects[1].selectedIndex - 1] || [];
            }
            break;
        }
        for(var i= 0; i < values.length; ++i){
            selects[index].options[selects[index].options.length] = new Option(values[i], values[i]);
        }
        for (var i = index + 1; i < selects.length; ++i) {
            refresh(i);
        }
    }

    for(var i = 0; i < selects.length; ++i) {
        selects[i] = document.getElementById(selects[i]);
    }
    selects[0].onchange = function() { refresh(1); };
    selects[1].onchange = function() { refresh(2); };
    refresh(0);
}`, callback);
    }
}

getDataURL(function (err, url) {
    if (err) {
        console.error("get data url error: " + err.stack);
        return 1;
    }

    parseData(url, function (err, data) {
        if (err) {
            console.error("parse data error: " + err.stack);
            return 1;
        }

        renderData(data, argv.output, function (err) {
            if (err) {
                console.error("render data error: " + err.stack);
                return 1;
            }

            console.info('build ' + argv.output + ' done');
            return 0;
        });
    });
});
