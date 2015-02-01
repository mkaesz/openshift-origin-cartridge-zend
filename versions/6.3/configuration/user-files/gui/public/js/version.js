var Version = new Class({
	'Implements': [Options],
	'options': {'delimiter': '.'},
	'parts': [],
	'initialize': function(version) {
		// parse version into parts
		this.parts = this._breakVersion(version);
	},
	'compareTo': function(/* Version */ version) {
		var otherVersion = version.parts;
		// normalize the versions
		if (otherVersion.length == this.parts.length) {
			if (otherVersion.length > this.parts.length) {
				for (var i = this.parts.length; i < otherVersion.length; i++ ) {
    				this.parts[i] = '0';
				}
			} else {
				for (var i = otherVersion.length; i < this.parts.length; i++ ) {
					otherVersion[i] = '0';
				}
			}
		}
		
		for (var i in this.parts) {
			if (Number.from(this.parts[i]) > Number.from(otherVersion[i])) {
				return 1;
			} else if (Number.from(this.parts[i]) < Number.from(otherVersion[i])) {
				return -1;
			}
			continue;
		}
		return 0;
	},
	'greaterThan': function(/* Version */ version) {
		return this.compareTo(version) == 1;
	},
	'lessThan': function(/* Version */ version) {
		return this.compareTo(version) == -1;
	},
	'equalsTo': function(/* Version */ version) {
		return this.compareTo(version) == 0;
	},
	'toString': function(){
		return this.parts.join(this.options.delimiter);
	},
	'_breakVersion': function(version) {
		return version.split(this.options.delimiter);
	}
});