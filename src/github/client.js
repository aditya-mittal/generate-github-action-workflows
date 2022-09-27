const axios = require('axios').default;
const _ = require('lodash');

const log4js = require('../logger.js');
const Repository = require('./model/repository.js');
const WorkflowRun = require('./model/workflowRun.js');
const logger = log4js.getLogger('GithubClient');

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
			}).catch((err) => {
				logger.error(`Unable to get repo: ${repoName}, error: ${err.message}`);
				throw new Error(`Unable to get repo: ${repoName}, error: ${err.message}`);
			});
	};

	this.listOrgRepos = function(orgName) {
		const path = `orgs/${orgName}/repos`;
		let params = this._getParams('GET', path);

		return axios(params)
			.then(response => {
				let repositoryList = [];
				response.data.forEach(function(repository) {
					repositoryList.push(new Repository(repository.name, repository.owner.login, repository.clone_url, repository.default_branch));
				});
				return repositoryList;
			}).catch((err) => {
				logger.error(`Unable to get list of repos for org: ${orgName}, error: ${err.message}`);
				throw new Error(`Unable to get list of repos for org: ${orgName}, error: ${err.message}`);
			});
	};

	this.listRepoWorkflowRuns = function(orgName, repoName) {
		const path = `repos/${orgName}/${repoName}/actions/runs`;
		let params = this._getParams('GET', path);
		return axios(params)
			.then(response => {
				let repoWorkflowRunList = [];
				if(response.data.total_count > 0) {
					response.data.workflow_runs.forEach(function(workflowRun) {
						repoWorkflowRunList.push(new WorkflowRun(workflowRun.id, workflowRun.name, workflowRun.path, workflowRun.status, workflowRun.conclusion, workflowRun.created_at));
					});
					repoWorkflowRunList = _.orderBy(repoWorkflowRunList, ['created_at'], ['desc']);
					return repoWorkflowRunList;
				} else {
					return Promise.reject(new Error(`No workflows run for this repo: ${repoName}, org: ${orgName} yet`));
				}
			}).catch((err) => {
				logger.error(`Unable to get list of workflow runs for repo: ${repoName}, org: ${orgName}, error: ${err.message}`);
				throw new Error(`Unable to get list of workflow runs for repo: ${repoName}, org: ${orgName}, error: ${err.message}`);
			});
	};

	this._getParams = function (method, path) {
		return {
			url: `https://${this.url}/${path}`,
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'j2ga',
				'Authorization': 'token ' + this.privateToken
			}
		};
	};
}

module.exports = GithubClient;