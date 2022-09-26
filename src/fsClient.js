const fs = require('fs');

const log4js = require('./logger.js');
const logger = log4js.getLogger('FsClient');
function FsClient() {

	this.mkdir = function(path) {
		return fs.promises.mkdir(path, { recursive: true })
			.catch(() => {
				logger.error(`Error occurred while creating directory: ${path}`);
				throw new Error(`Error occurred while creating directory: ${path}`);
			});
	};

	this.rm = function(path) {
		return fs.promises.rm(path, { recursive: true })
			.catch(() => {
				logger.error(`Error occurred while removing the directory: ${path}`);
				throw new Error(`Error occurred while removing the directory: ${path}`);
			});
	};

	this.copyFile = function(src, dest) {
		return fs.promises.copyFile(src, dest)
			.catch(() => {
				logger.error(`Error occurred while copying the src: ${src} to destination: ${dest}`);
				throw new Error(`Error occurred while copying the src: ${src} to destination: ${dest}`);
			});
	};

	this.readFile = function(pathToFile) {
		return fs.promises.readFile(pathToFile)
			.catch(() => {
				logger.error(`Error occured while reading the file: ${pathToFile}`);
				throw new Error(`Error occured while reading the file: ${pathToFile}`);
			});
	};
}

module.exports = FsClient;