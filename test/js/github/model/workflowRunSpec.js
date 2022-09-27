const WorkflowRun = require('../../../../src/github/model/workflowRun.js');

describe('WorkflowRun', function() {
	it('must have id, name, path, status, conclusion & created_at', function() {
		//given
		const id = '123';
		const name = 'some-workflow-run';
		const path = '.github/workflows/build.yml';
		const status = 'completed';
		const conclusion = 'success';
		const created_at = '2022-09-26T14:51:52Z';
		//when
		const workflowRun = new WorkflowRun(id, name, path, status, conclusion, created_at);
		//then
		workflowRun.should.be.a('object');
		workflowRun.should.be.instanceof(WorkflowRun);
		workflowRun.should.have.property('id');
		workflowRun.should.have.property('name');
		workflowRun.should.have.property('path');
		workflowRun.should.have.property('status');
		workflowRun.should.have.property('conclusion');
		workflowRun.should.have.property('created_at');
		workflowRun.should.have.all.keys('id', 'name', 'path', 'status', 'conclusion', 'created_at');
		workflowRun.id.should.equal(id);
		workflowRun.name.should.equal(name);
		workflowRun.path.should.equal(path);
		workflowRun.status.should.equal(status);
		workflowRun.conclusion.should.equal(conclusion);
		workflowRun.created_at.should.equal(created_at);
	});
});