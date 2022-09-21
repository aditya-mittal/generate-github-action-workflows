const sinon = require('sinon');
const proxyquire =  require('proxyquire');

const WorkflowCreator = require('../../src/workflowCreator.js');

describe('Tests for cli', () => {
	const workflowCreator = new WorkflowCreator();
	let workflowCreatorStub;

	describe('Generate github actions workflows for repos under org', function () {
		let createWorkflowsStub;
		before(() => {
			workflowCreatorStub = sinon.stub(workflowCreator, 'createWorkflows');
			createWorkflowsStub = function StubWorkflowCreator() {
				this.createWorkflows = workflowCreatorStub;
			};
			workflowCreatorStub.returns(0);
		});
		after(() => {
			sinon.restore();
		});
		it('should call createWorkflows for all repos under specified org', async function () {
			//given
			const githubOrgName = 'FOO';
			//when
			process.argv = `node ../../src/cli.js create-workflows ${githubOrgName}`.split(' ');
			await proxyquire('../../src/cli.js', { './workflowCreator': createWorkflowsStub });
			//then
			sinon.assert.calledWith(workflowCreatorStub, githubOrgName);
		});
	});
});