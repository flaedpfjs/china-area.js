var curl        = require('node-curl')
  , htmlparser2 = require('htmlparser2')
  , fs          = require('fs');


var url = "http://www.stats.gov.cn/tjsj/tjbz/xzqhdm/201401/t20140116_501070.html";
var file = process.argv[2];

console.log('input file: ' + url);

curl(url, function (err) {
	if (err) {
		console.log(err);
		return;
	}

	var provinces = [];
	var cities	= [];
	var counties  = [];
	var matched = false;
	var parser = new htmlparser2.Parser({
		onopentag: function(name, attrs){
			matched = (name == 'p' && typeof(attrs.class) != 'undefined' && attrs.class.indexOf('MsoNormal') !== -1);
		},
		ontext: function(text){
			if (matched) {
				text = text.replace(/&nbsp;/g, " ").trim();
				var id = text.substr(0, 6);
				var name = text.substr(6).trim();
				var levels = [id.substr(0, 2), id.substr(2, 2), id.substr(4)];
				if (id.substr(2) == '0000') {
					provinces.push(name);
				} else if (id.substr(4, 2) == '00') {
					if (! cities[provinces.length - 1]) {
						cities[provinces.length - 1] = [];
					}
					cities[provinces.length - 1].push(name);
				} else if (id) {
					if (! counties[provinces.length - 1]) {
						counties[provinces.length - 1] = [];
					}
					if (! counties[provinces.length - 1][cities[provinces.length - 1].length - 1]) {
						counties[provinces.length - 1][cities[provinces.length - 1].length - 1] = [];
					}
					counties[provinces.length - 1][cities[provinces.length - 1].length - 1].push(name);
				}
			}
		},
		onclosetag: function(tagname){
			matched = false;
		}
	});
	parser.write(this.body);
	parser.end();

	fs.writeFile(file, 
                 "function chinaAreaInit(selects, defaults) {\n\n" +
	             "var data = " + JSON.stringify([provinces, cities, counties], null, '\t') + ";\n" +
	             "function refresh (index) {\n" +
	             "    selects[index].length = 0;\n" +
	             "    selects[index].options[0] = new Option(defaults[index], '');\n" +
	             "    var values = [];\n" +
	             "    switch(index) {\n" +
	             "    case 0:\n" +
	             "        values = data[index] || [];\n" +
	             "        break;\n" +
	             "    case 1:\n" +
	             "        if (selects[0].selectedIndex > 0) {\n" +
	             "            values = data[index][selects[0].selectedIndex - 1] || [];\n" +
	             "        }\n" +
	             "        break;\n" +
	             "    case 2:\n" +
	             "        if (selects[0].selectedIndex > 0 && selects[1].selectedIndex > 0) {\n" +
	             "            values = data[index][selects[0].selectedIndex - 1][selects[1].selectedIndex - 1] || [];\n" +
	             "        }\n" +
	             "        break;\n" +
	             "    }\n" +
	             "	for(var i= 0; i < values.length; ++i){\n" +
	             "		selects[index].options[selects[index].options.length] = new Option(values[i], values[i]);\n" +
	             "	}\n" +
	             "    for (var i = index + 1; i < selects.length; ++i) {\n" +
	             "        refresh(i);\n" +
	             "    }\n" +
	             "}\n" +
	             "\n" +
	             "for(var i = 0; i < selects.length; ++i) {\n" +
	             "    selects[i] = document.getElementById(selects[i]);\n" +
	             "}\n" +
	             "selects[0].onchange = function() { refresh(1); };\n" +
	             "selects[1].onchange = function() { refresh(2); };\n" +
	             "refresh(0);\n" +
	             "\n}",
                function (err) {
                    if (err) {
                        console.error('output file error: ' + file);
                    } else {
                        console.log('output file: ' + file);
                    }
                });
});
