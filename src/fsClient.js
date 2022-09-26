const fs = require('fs');

function FsClient() {

	this.mkdir = function(path) {
		return fs.promises.mkdir(path, { recursive: true })
			.catch(() => {
				throw new Error(`Error occurred while creating directory, ${path}`);
			});
	};

	this.rm = function(path) {
		return fs.promises.rm(path, { recursive: true })
			.catch(() => {
				throw new Error(`Error occurred while removing the directory, ${path}`);
			});
	};

	this.copyFile = function(src, dest) {
		return fs.promises.copyFile(src, dest)
			.catch(() => {
				throw new Error(`Error occurred while copying the src file, ${src} to destination ${dest}`);
			});
	};

	this.readFile = function(pathToFile) {
		return fs.promises.readFile(pathToFile)
			.catch(() => {
				throw new Error(`Error occured while reading the file, ${pathToFile}`);
			});
	};
}

module.exports = FsClient;