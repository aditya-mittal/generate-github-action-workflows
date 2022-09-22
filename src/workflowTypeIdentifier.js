const fs = require('fs');

function WorkflowTypeIdentifier(workflowTypeMap) {
	this.workflowTypeMap = new Map(Object.entries(workflowTypeMap));

	this.getWorkflowType = function(pathToFile, repoName) {
		if( !fs.existsSync(pathToFile) ) {
			return Promise.reject(new Error(`File ${pathToFile} does not exist for repo ${repoName}`))
				.then(() => {}, (error) => {
					console.error(error);
					throw new Error(error);
				});
		}
		return fs.promises.readFile(pathToFile, (err) => {
			if (err) {
				console.error(`Error occured while reading the file ${pathToFile} for repo ${repoName}`);
				throw new Error(`Error occured while reading the file ${pathToFile} for repo ${repoName}`);
			}
		}).then((fileData)=> {
			let workflowType;
			this.workflowTypeMap.forEach(function(githubWorkflowType, jenkinsLibraryType) {
				if(fileData.includes(jenkinsLibraryType)) {
					workflowType = githubWorkflowType;
				}
			});
			if(workflowType === undefined) {
				throw new Error(`No mapping found for shared lib and Github workflow for repo ${repoName}`);
			}
			return workflowType;
		});
	};
}
module.exports = WorkflowTypeIdentifier;