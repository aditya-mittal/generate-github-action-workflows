function Repository(name, owner_name, clone_url, default_branch) {
	this.name = name;
	this.owner_name = owner_name;
	this.clone_url = clone_url;
	this.default_branch = default_branch;
}

Repository.prototype.startsWith = function(namePrefix) {
	return this.name.startsWith(namePrefix);
};

module.exports = Repository;