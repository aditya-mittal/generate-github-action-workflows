const fs = require('fs');

function FsClient() {

	this.mkdir = function(path) {
		return fs.mkdirSync(path, { recursive: true });
	};

	this.copyFile = function(src, dest) {
		return fs.copyFile(src, dest, (err) => {
			if(err) {
				console.error(`Error occurred while copying the src file, ${src} to destination ${dest}`);
			}
		});
	};
}

module.exports = FsClient;