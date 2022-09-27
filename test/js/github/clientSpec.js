const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
const expect = chai.expect;
const should = require('chai').should();
const nock = require('nock');
const config = require('config');

const GithubClient = require('../../../src/github/client.js');
const Repository = require('../../../src/github/model/repository.js');
const WorkflowRun = require('../../../src/github/model/workflowRun.js');
const repoDetails = require('../../resources/github/repoDetails.json');
const repoList = require('../../resources/github/repoList.json');
const repoWorkflowRunList = require('../../resources/github/workflowRunList.json');
const repoNoWorkflowRunList = require('../../resources/github/noWorkflowRunList.json');

describe('Github client', function() {
	const GITHUB_API_URL = config.get('j2ga.github.url');
	const GITHUB_PRIVATE_TOKEN = config.get('j2ga.github.token');
	const GITHUB_USERNAME = config.get('j2ga.github.username');
	const githubClient = new GithubClient(GITHUB_API_URL, GITHUB_USERNAME, GITHUB_PRIVATE_TOKEN);
	let api;
	beforeEach(() => {
		api = nock(
			'https://' + GITHUB_API_URL, {
				reqHeaders: {
					'Content-Type': 'application/json',
					'User-Agent': 'j2ga',
					'Authorization': 'token ' + GITHUB_PRIVATE_TOKEN
				}
			}
		);
	});
	afterEach(() => {
		nock.cleanAll();
	});

	describe('#getRepo', function() {
		it('should get the repo based on name provided', async () => {
			//given
			const owner = 'foo-user';
			const repoName = 'some-repo';
			api.get(`/repos/${owner}/${repoName}`).reply(200, repoDetails);
			//when
			const repository = await githubClient.getRepo(owner, repoName);
			//then
			repository.name.should.equal('some-repo');
			repository.clone_url.should.equal('https://github.com/foo-user/some-repo.git');
		});
		it('should throw error when github returns 404 on get repo', async () => {
			//given
			const owner = 'foo-user';
			const repoName = 'some-repo';
			api.get(`/repos/${owner}/${repoName}`).reply(404);
			//when
			assert.isRejected(
				githubClient.getRepo(owner, repoName),
				Error,
				`Unable to get repo: ${repoName}`
			);
		});
	});
	describe('#listOrgRepos', function() {
		it('should get the list of repos under specified org', async () => {
			//given
			const orgName = 'some-org';
			api.get(`/orgs/${orgName}/repos`).reply(200, repoList);
			//when
			const repositoryList = await githubClient.listOrgRepos(orgName);
			//then
			repositoryList.should.be.an('array');
			repositoryList.should.have.lengthOf(2);
			repositoryList[0].should.be.a('object');
			repositoryList[0].should.be.instanceof(Repository);
			repositoryList[0].should.have.all.keys('name', 'owner_name', 'clone_url', 'default_branch');
			repositoryList[0].name.should.equal('Hello-World');
			repositoryList[0].owner_name.should.equal('octocat');
			repositoryList[0].default_branch.should.equal('master');
			repositoryList[1].should.have.all.keys('name', 'owner_name', 'clone_url', 'default_branch');
			repositoryList[1].name.should.equal('Hey-World');
			repositoryList[1].owner_name.should.equal('octocat');
			repositoryList[1].default_branch.should.equal('main');
		});
		it('should throw error when github returns 404 on list repo', async () => {
			//given
			const orgName = 'some-org';
			api.get(`/orgs/${orgName}/repos`).reply(404);
			//when
			assert.isRejected(
				githubClient.listOrgRepos(orgName),
				Error,
				`Unable to get list of repos for org: ${orgName}`
			);
		});
	});

	describe('#listRepoWorkflowRuns', function() {
		it('should get the list of workflowRuns for a specific repo under specified org', async () => {
			//given
			const orgName = 'some-org';
			const repoName = 'some-repo';
			api.get(`/repos/${orgName}/${repoName}/actions/runs`).reply(200, repoWorkflowRunList);
			//when
			const workflowRunList = await githubClient.listRepoWorkflowRuns(orgName, repoName);
			//then
			workflowRunList.should.be.an('array');
			workflowRunList.should.have.lengthOf(2);
			workflowRunList[0].should.be.a('object');
			workflowRunList[0].should.be.instanceof(WorkflowRun);
			workflowRunList[0].should.have.all.keys('id', 'name', 'path', 'status', 'conclusion', 'created_at');
			workflowRunList[0].name.should.equal('Build');
			workflowRunList[0].path.should.equal('.github/workflows/build.yml');
			workflowRunList[0].status.should.equal('completed');
			workflowRunList[0].conclusion.should.equal('success');
			workflowRunList[1].should.have.all.keys('id', 'name', 'path', 'status', 'conclusion', 'created_at');
			workflowRunList[1].name.should.equal('Build');
			workflowRunList[1].path.should.equal('.github/workflows/build.yml');
			workflowRunList[1].status.should.equal('completed');
			workflowRunList[1].conclusion.should.equal('failure');
		});
		it('should reject promise when github returns no workflows for a repo who has no workflow run yet', async () => {
			//given
			const orgName = 'some-org';
			const repoName = 'some-repo';
			api.get(`/repos/${orgName}/${repoName}/actions/runs`).reply(200, repoNoWorkflowRunList);
			//when
			assert.isRejected(
				githubClient.listRepoWorkflowRuns(orgName, repoName),
				Error,
				`Unable to get list of workflow runs for repo: ${repoName}, org: ${orgName}`
			);
		});
		it('should throw error when github returns 404 on list workflow runs for a repo', async () => {
			//given
			const orgName = 'some-org';
			const repoName = 'some-repo';
			api.get(`/orgs/${orgName}/${repoName}/actions/runs`).reply(404);
			//when
			assert.isRejected(
				githubClient.listRepoWorkflowRuns(orgName, repoName),
				Error,
				`Unable to get list of workflow runs for repo: ${repoName}, org: ${orgName}`
			);
		});
	});
});