#!/usr/bin/env node

const { Command } = require('commander');

const log4js = require('./logger.js');
const WorkflowCreator = require('./workflowCreator.js');
const logger = log4js.getLogger('cli');

const workflowCreator = new WorkflowCreator();
const program = new Command();

program
	.command('create-workflows <github-org-name>')
	.description('Generate workflows for all repos under the specified Github org')
	.action(async (githubOrgName) => {
		await generateWorkflows(githubOrgName);
	});

program.parse(process.argv);

async function generateWorkflows(githubOrgName) {
	try {
		await workflowCreator.createWorkflows(githubOrgName);
	} catch(error) {
		logger.error(error.message);
	}
}