const axios = require('axios').default;
const Repository = require('./model/repository.js');

function GithubClient(url, username, privateToken) {
	this.url = url;
	this.username = username;
	this.privateToken = privateToken;

	this._getParams = function (method, path) {
		return {
			url: `https://${this.url}/${path}`,
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'gl2gh',
				'Authorization': 'token ' + this.privateToken
			}
		};
	};
}

module.exports = GithubClient;