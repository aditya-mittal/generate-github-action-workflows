const log4js = require('log4js');
log4js.configure({
	appenders: {
		out: { type: 'stdout' , layout: {type: 'colored'} },
		j2ga: { type: 'file', filename: 'log/j2ga.log'}
	},
	categories: { default: { appenders: ['out', 'j2ga'], level: 'info' } },
});

module.exports = log4js;