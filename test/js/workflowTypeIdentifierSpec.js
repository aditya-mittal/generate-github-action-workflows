const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
const expect = chai.expect;

const path = require('path');
const config = require('config');

const WorkflowTypeIdentifier = require('../../src/workflowTypeIdentifier.js');

describe('WorkflowTypeIdentifier', function() {
	const workflowTypeIdentifier = new WorkflowTypeIdentifier(config.get('j2ga.jenkins2githubWorkflowsMap'));
	describe('#getWorkflowType', function() {
		before(() => {
			console.log('Workflow identifier started');
		});
		it('should identify correct workflow type based on shared pipeline mentioned in Jenkinsfile', async function() {
			//given
			const pathToJenkinsFile = path.join(process.cwd(), 'test','resources', 'sharedLibJenkinsfile');
			const repoName = 'some-repo';
			//when
			const workflowType = await workflowTypeIdentifier.getWorkflowType(pathToJenkinsFile, repoName);
			//then
			assert.strictEqual(workflowType, 'java-gradle-workflow.yml');
		});
		it('throw error when there is no known shared pipeline mentioned in Jenkinsfile', function() {
			//given
			const pathToJenkinsFile = path.join(process.cwd(), 'test','resources', 'plainJenkinsfile');
			const repoName = 'some-repo';
			const errorMessage = `No mapping found for shared lib and Github workflow for repo: ${repoName}`;
			//when & then
			assert.isRejected(
				workflowTypeIdentifier.getWorkflowType(pathToJenkinsFile, repoName),
				Error,
				errorMessage
			);
		});
		it('throw error when there is no Jenkinsfile', function() {
			//given
			const nonExistentFile = path.join(process.cwd(), 'test','resources', 'nonExistingFile');
			const repoName = 'some-repo';
			const errorMessage = `File: ${nonExistentFile} does not exist for repo: ${repoName}`;
			//when & then
			assert.isRejected(
				workflowTypeIdentifier.getWorkflowType(nonExistentFile, repoName),
				Error,
				errorMessage
			);
		});
	});
});
