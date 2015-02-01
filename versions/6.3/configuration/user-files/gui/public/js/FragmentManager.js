var FragmentManager = new Class({
	Implements: [Options],
	options: {
		'cookieName': null,
		'context': null
	},
	
	initialize: function(options){
		this.setOptions(options);
		if (this.options.cookieName && this.options.context) {
			var fragmentCookie = JSON.decode(Cookie.read(this.options.cookieName));
			if (fragmentCookie && fragmentCookie[this.options.context] && (! location.hash)) {
				location.hash = fragmentCookie[this.options.context];
			}
		}
	},
	
	getFragmentString: function() {
		if (window.location.hash.length > 0) {
			return window.location.hash.substring(1);
		}
		return '';
	},
	
	getFragmentValue: function(key) {
		var fragment = this.getFragmentObject();
		if (fragment[key] != undefined && fragment[key][0].trim() != '') {
			return fragment[key][0]; 
		}
		
		return null;
	},
	
	getFragmentArray: function(key) {
		var fragment = this.getFragmentObject();
		if (fragment[key] != undefined && fragment[key] instanceof Array) {
			return fragment[key]; 
		}
		
		return null;
	},
	
	/**
	 * Returns an object with all fragment parts parsed for use
	 * Fragment parts are always Array - even if it contains only a single element!
	 * @returns Object
	 */
	getFragmentObject: function() {
		var parsedFragments = {};

		if (window.location.hash.length > 0) {
			parsedFragments = window.location.hash.substring(1).parseQueryString();
		}

		return Object.map(parsedFragments, function(item, key){
			return item.split(',');
		});
	},
	
	resetFragment: function() {
		if ("pushState" in history) {
			var search = window.location.search;
			history.pushState("", document.title, window.location.pathname + search);
		} else {
			location.hash = '';
		}
	},
	
	addToUriFragment: function(partName, partContent) {
		var parsedFragments = this.getFragmentObject();

		if (! parsedFragments[partName]) {
			parsedFragments[partName] = [];
		}
		
		/// avoid duplicates
		if (parsedFragments[partName].indexOf(partContent) > -1) {
			return ;
		}
		
		parsedFragments[partName].push(partContent);
		parsedFragments[partName] = parsedFragments[partName].join(',');
		
		this._writeToLocation(parsedFragments);
	},
	
	setUriFragment: function(partName, partContent) {
		this.removeUriFragment(partName);
		this.addToUriFragment(partName, partContent);
	},
	
	removeUriFragment: function(partName) {
		var parsedFragments = this.getFragmentObject();

		if (parsedFragments[partName]) {
			parsedFragments = this._removeFragmentPart(parsedFragments, partName);
		}

		this._writeToLocation(parsedFragments);
	},
	
	deleteFromUriFragment: function(partName, partContent) {
		var parsedFragments = this.getFragmentObject();
		
		if (! parsedFragments[partName]) {
			return ;
		}
		
		parsedFragments[partName] = parsedFragments[partName].filter(function(item){
			return typeof item != 'undefined' && item.length > 0;
		});

		var partValueIndex = parsedFragments[partName].indexOf(partContent);
		
		if (partValueIndex == -1) {
			return ;
		}

		delete parsedFragments[partName][partValueIndex];
		parsedFragments[partName] = parsedFragments[partName].filter(function(item){
			return item != 'undefined' && item;
		});
		
		// completely remove the fragment part
		if (parsedFragments[partName].length == 0) {
			parsedFragments = this._removeFragmentPart(parsedFragments, partName);
		} else {
			parsedFragments[partName] = parsedFragments[partName].join(',');
		}
		
		if (Object.values(parsedFragments).length > 0) {
			this._writeToLocation(parsedFragments);
		}
	},
	
	_removeFragmentPart: function(parsedFragments, partName) {
		delete parsedFragments[partName];
		/// fragment is completely empty, remove the hash sign
		if (Object.values(parsedFragments).length == 0) {
			this.resetFragment();
		}
		return parsedFragments;
	},
	
	_writeCookie: function() {
		if (this.options.cookieName && this.options.context) {
			var existingContent = JSON.decode(Cookie.read(this.options.cookieName));
			if (existingContent == null) {
				existingContent = {};
			}
			existingContent[this.options.context] = this.getFragmentString();
			Cookie.write(this.options.cookieName, JSON.encode(existingContent));
		}
	},
	
	_writeToLocation: function(fragments) {
		var newFragments = Object.map(fragments, function(item){
			return Array.from(item).join(',');
		});
		var hash = Object.toQueryString(newFragments).replace(/%2C/g, ',');
		location.hash = hash;
		this._writeCookie();
	}
});