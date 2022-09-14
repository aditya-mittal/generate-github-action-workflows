const axios = require('axios').default;
const Repository = require('./model/repository.js');

function GithubClient(url, username, privateToken) {
	this.url = url;
	this.username = username;
	this.privateToken = privateToken;

	this.getRepo = function(owner, repoName) {
		const path = `repos/${owner}/${repoName}`;
		const data = {
			'name': repoName
		};
		let params = this._getParams('GET', path);
		params.data = data;

		return axios(params)
			.then(response => {
				return new Repository(response.data.name, response.data.owner.login, response.data.clone_url);
			}).catch((error) => {
				console.error(error);
				throw new Error(`Unable to get repo with name ${repoName}`);
			});
	};
	this.listOrgRepos = function(orgName) {
		const path = `orgs/${orgName}/repos`;
		let params = this._getParams('GET', path);

		return axios(params)
			.then(response => {
				let repositoryList = [];
				response.data.forEach(function(repository) {
					repositoryList.push(new Repository(repository.name, repository.owner.login, repository.clone_url));
				});
				return repositoryList;
			}).catch((error) => {
				console.error(error);
				throw new Error(`Unable to get repos for org ${orgName}`);
			});
	};

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