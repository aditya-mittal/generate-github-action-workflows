function WorkflowRun(id, name, path, status, conclusion, created_at) {
	this.id = id;
	this.name = name;
	this.path = path;
	this.status = status;
	this.conclusion = conclusion;
	this.created_at = created_at;
}

module.exports = WorkflowRun;