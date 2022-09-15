const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const nock = require('nock');
const sinon = require('sinon');
const git = require('isomorphic-git');
const fs = require('fs');
const config = require('config');
const proxyquire = require('proxyquire');

const replaceStub = function() {
	Promise.resolve();
};

const WorkflowCreator = proxyquire('../../src/workflowCreator.js', {'replace': replaceStub});

const repoList = require('../resources/github/repoList.json');

describe('Workflow creator', function() {
	const workflowCreator = new WorkflowCreator();
	const GITHUB_API_URL = config.get('gl2gh.github.url');
	const GITHUB_PRIVATE_TOKEN = config.get('gl2gh.github.token');

	let githubApi;
	let gitCloneStub;
	let gitAddStub;
	let gitCommitStub;
	let gitPushStub;
	let fsMkDirStub;
	let fsCopyFileStub;
	beforeEach(() => {
		gitCloneStub = sinon.stub(git, 'clone');
		gitAddStub = sinon.stub(git, 'add');
		gitCommitStub = sinon.stub(git, 'commit');
		gitPushStub = sinon.stub(git, 'push');
		fsMkDirStub = sinon.stub(fs, 'mkdir');
		fsCopyFileStub = sinon.stub(fs, 'copyFile');
		githubApi = nock(
			'https://' + GITHUB_API_URL, {
				reqHeaders: {
					'Content-Type': 'application/json',
					'User-Agent': 'gl2h',
					'Authorization': 'token ' + GITHUB_PRIVATE_TOKEN
				}
			}
		);
	});
	afterEach(() => {
		nock.cleanAll();
	});

	it.only('should generate workflows for all repos under the specified github org', async () =>  {
		//given
		const githubOrgName = 'test-migration-org-1-gh';
		githubApi.get(`/orgs/${githubOrgName}/repos`).reply(200, repoList);
		gitCloneStub.returns(Promise.resolve());
		fsMkDirStub.returns(Promise.resolve());
		fsCopyFileStub.returns(Promise.resolve());
		gitAddStub.returns(Promise.resolve());
		gitCommitStub.returns(Promise.resolve());
		gitPushStub.returns(Promise.resolve());
		//when
		const result = await workflowCreator.createWorkflows(githubOrgName);
		//then
		expect(result).to.equal(0);
		sinon.assert.callCount(gitCloneStub, 2);
		sinon.assert.callCount(fsMkDirStub, 2);
		sinon.assert.callCount(fsCopyFileStub, 2);
		sinon.assert.callCount(gitAddStub, 2);
		sinon.assert.callCount(gitCommitStub, 2);
		sinon.assert.callCount(gitPushStub, 2);
	});
});