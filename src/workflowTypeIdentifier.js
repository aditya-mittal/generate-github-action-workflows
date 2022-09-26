const fs = require('fs');

const log4js = require('./logger.js');
const FsClient = require('./fsClient.js');
const logger = log4js.getLogger('WorkflowTypeIdentifier');

function WorkflowTypeIdentifier(workflowTypeMap) {
	this.workflowTypeMap = new Map(Object.entries(workflowTypeMap));
	const fsClient = new FsClient();

	this.getWorkflowType = function(pathToFile, repoName) {
		if( !fs.existsSync(pathToFile) ) {
			return Promise.reject(new Error(`File: ${pathToFile} does not exist for repo: ${repoName}`))
				.then(() => {}, (err) => {
					logger.error(err.message);
					throw new Error(err.message);
				});
		}
		return fsClient.readFile(pathToFile)
			.then((fileData)=> {
				let workflowType;
				this.workflowTypeMap.forEach(function(githubWorkflowType, jenkinsLibraryType) {
					if(fileData.includes(jenkinsLibraryType)) {
						workflowType = githubWorkflowType;
					}
				});
				if(workflowType === undefined) {
					logger.error(`No mapping found for shared lib and Github workflow for repo: ${repoName}`);
					throw new Error(`No mapping found for shared lib and Github workflow for repo: ${repoName}`);
				}
				return workflowType;
			});
	};
}
module.exports = WorkflowTypeIdentifier;