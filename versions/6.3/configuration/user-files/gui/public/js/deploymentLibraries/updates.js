var deploymentLibrariesUpdates = new Class({
	updateUrl: '',
	reportUpdateUrl: '',
	reportNoUpdateUrl: '',
	Implements: [Events,Options],
	checkedItems: [],
	needUpdates: [],
	updateProcess: [],
	boostrap: false,
	zsVersion: '',
	phpVersion: '',
	osName: '',
	arch: '',
	uniqueId: '',
	
	initialize: function(updateUrl, reportUpdateUrl, reportNoUpdateUrl, zsVersion, phpVersion, osName, arch, uniqueId) {
		this.updateUrl = updateUrl;
		if (document.location.protocol != "http:") {
			this.updateUrl = this.updateUrl.replace('http:','https:');
		}
		
		this.reportUpdateUrl = reportUpdateUrl;
		this.reportNoUpdateUrl = reportNoUpdateUrl;
		this.zsVersion = zsVersion;
		this.phpVersion = phpVersion;
		this.osName = osName;
		this.arch = arch;
		this.uniqueId = uniqueId;

		var zs6BootstrapCookie = Cookie.read('ZS6Bootstrapped');
		if (zs6BootstrapCookie != null) {
			this.boostrap = true;
			Cookie.dispose('ZS6Bootstrapped');
		}
		
		if (! Browser.ie9){
			var zs6LibsCookie = Cookie.read('ZS6LIBRARIES');
			if (zs6LibsCookie != null) {
				var libs = JSON.decode(zs6LibsCookie.replace(/\+/gi, ' '));
				Object.each(libs, function(lib, name) {
					this.check(name, lib.version, lib.url);
				}.bind(this));
			}
		}
	},
	
	check: function(name, currentVersion, checkUrl) {
		if (this.updateProcess.length == 0) {
			this.fireEvent('startingUpdate');
		}
		
		this.updateProcess.push(name);
		
		// build parameters according to the url
		if (this.updateUrl.contains('?')) {
			var updateUrl = this.updateUrl + '&name=' + name;
		} else {
			var updateUrl = this.updateUrl + '?name=' + name;
		}
		
		updateUrl += '&currVer=' + currentVersion + '&packageUrl=' + encodeURIComponent(checkUrl) + 
				   '&zs=' + this.zsVersion + '&php=' + this.phpVersion + '&os=' + this.osName + '&arch=' + this.arch + '&hash=' + this.uniqueId + '&r=' + String.uniqueID();
		
		if (this.boostrap) {
			this.boostrap = false;
			updateUrl += '&boot=1';			
		}
		
		// we are using XMLHttpRequest because the update url will contain redirect header and mootools Request object
		// isn't handling it at all
		var http = new XMLHttpRequest();
		http.open("GET", updateUrl, true);
		http.onreadystatechange = function() {
			if(http.readyState == 4 && http.status == 200) {
				var response = JSON.decode(http.responseText);
				var updateError = false;
				if (response.version) {
					// check version is bigger than current
					if (this.versionCompare(response.version, currentVersion) == 1) {
						this.needUpdates[name] = response;
						this.reportNewUpdate(name, response.version, response);
					} else {
						this.reportNoUpdateNeeded(name, response.version);
						this.fireEvent('noUpdateNeeded', {'name': name});
					}
					this.checkedItems.push(name);
				} else {
					updateError = true;
				}
				
				this.updateProcess.erase(name);
				this.fireEvent('finishUpdateRow', {'name': name});
				
				// finished with update
				if (this.updateProcess.length == 0) {
					this.fireEvent('finishUpdate');
				}
				
				if (updateError) {
					this.fireEvent('updateError', {'name': name});
				}
			} else {
				this.updateProcess.erase(name);
				this.fireEvent('finishUpdateRow', {'name': name});
				
				// finished with update
				if (this.updateProcess.length == 0) {
					this.fireEvent('finishUpdate');
				}
				
				this.fireEvent('updateError', {'name': name});
			}
		}.bind(this);
		
		// timeout event of 15 seconds
		http.timeout = 15000;
		http.ontimeout = function () {
			this.updateProcess.erase(name);
			this.fireEvent('finishUpdateRow', {'name': name});
			
			// finished with update
			if (this.updateProcess.length == 0) {
				this.fireEvent('finishUpdate');
			}
			
			this.fireEvent('updateError', {'name': name});
		}.bind(this);
		http.send(null);
	},
	
	wasChecked: function(name) {
		if (this.checkedItems.contains(name)) {
			return true;
		}
		
		return false;
	},
	
	inUpdateProcess: function(name) {
		if (this.updateProcess.contains(name)) {
			return true;
		}
		
		return false;
	},
	
	needUpdate: function(name, version) {
		if (this.needUpdates[name] != undefined) {
			if (this.versionCompare(this.needUpdates[name].version, version) == 1) {
				return true;
			}
			
			this.needUpdates.erase(name);
		}
		
		return false;
	},
	
	getUpdateData: function(name) {
		if (this.needUpdates[name] != undefined) {
			return this.needUpdates[name];
		}
		
		return null;
	},
	
	versionCompare: function(left, right) {
	    if (typeof left + typeof right != 'stringstring') {
	        return false;
	    }
	    
	    var a = left.split('.');
	    var b = right.split('.');
	    var i = 0, len = Math.max(a.length, b.length);
	        
	    for (; i < len; i++) {
	        if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
	            return 1;
	        } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
	            return -1;
	        }
	    }
	    
	    return 0;
	},
	
	// report the new update availibilty to the server
	reportNewUpdate: function(name, version, extraData) {
		var request = new Request.JSON({
			url: this.reportUpdateUrl,
			data: {'name': name, 'version': version, 'extraData': extraData},
			onSuccess: function(response) {
				this.fireEvent('finishReportNewUpdate', {'name': name});
			}.bind(this)
		}).post();
	},
	
	// report no update needed to the server
	reportNoUpdateNeeded: function(name, version) {
		var request = new Request.JSON({
			url: this.reportNoUpdateUrl,
			data: {'name': name, 'version': version},
			onSuccess: function(response) {
				this.fireEvent('finishReportNoUpdateNeeded', {'name': name});
			}.bind(this)
		}).post();
	}
});