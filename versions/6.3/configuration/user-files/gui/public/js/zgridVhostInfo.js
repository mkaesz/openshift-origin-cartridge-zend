var zgridVhostInfo = new Class({
	Implements: [Events,Options],
	
	data: {},
	responseData: {},
	showUserParams: true,
	reload: false,
	
	getOptions: function(){
		return {
			url: null
		};
	},
	
	initialize: function(options){
		this.setOptions(this.getOptions(), options);
	},
	
	onLoadData: function (data, slide, response)
	{
		// to save data of the application row
		this.data = data;
		
		if (response) {
			this.responseData = response.responseData;
			var rowContent = this.getRow(response.responseData);
			$(data.rowId).set('html', rowContent);
                        
			var tabPane = new TabPane('tableDescContent_' + data.id, {}, function() {
				return 0;
            });
            
			if (slide) {
				var myVerticalSlide = new Fx.Slide('tableDescContent_' + data.id, {resetHeight: true});
				myVerticalSlide.hide();
				myVerticalSlide.slideIn();
			}
		}
	},
	
	reloadData: function(data) {
		this.reload = true;
		this.loadData(data);
	},
	
	loadData: function(data)
	{
		
		slide = (!this.reload);
		if (this.reload) {
			this.reload = false;
		}
		
		if (!this.options.url)
			return;
		
		var params = {
			vhost: data.id
		};
		
		var request = new Request.WebAPI({url: this.options.url, data:params});

		request.addEvent("complete", this.onLoadData.bind(this, data, slide));

		request.get();
	}, 
	
	hideUserParams:function() {
		this.showUserParams = false;
	},
	
	getRow: function(data) {
		var vhostInfo = data.vhostDetails.vhostInfo;
		var applications = data.vhostDetails.vhostExtended.vhostApplications;
		var docroot = data.vhostDetails.vhostExtended.docRoot;
		var certificateAppName = data.vhostDetails.vhostExtended.sslAppName;
		var certificatePath = data.vhostDetails.vhostExtended.sslCertificatePath;
		var certificateKeyPath = data.vhostDetails.vhostExtended.sslCertificateKeyPath;
		var certificateChainPath = data.vhostDetails.vhostExtended.sslCertificateChainPath;
		var template = data.vhostDetails.vhostExtended.text;
		if (template == null) {
			template = '';
		}
		var servers = data.vhostDetails.vhostInfo.servers;
		
		if (vhostInfo.status == 'Modified') {
			servers.each(function(server) {
				if (server.status == 'Modified' && server.lastMessage != '') {
					var diff = JSON.decode(server.lastMessage)[0];
					var lines = diff.split('\n');
					var newTemplate = '';
					lines.each(function(line) {
						line = line.htmlEntities();
						if (line[0] == ' ') {
							newTemplate += '<span class="regularLine">' + line.substr(1) + '</span>\n';
						} else if (line[0] == '-') {
							newTemplate += '<span class="removedLine">' + line + '</span>\n';
						} else if (line[0] == '+') {
							newTemplate += '<span class="addedLine">' + line + '</span>\n';
						}
					});
					template = newTemplate;
				}
			});
		} else {
			var lines = template.split('\n');
			var newTemplate = '';
			lines.each(function(line) {
				newTemplate += line.htmlEntities() + '\n';
			});
			template = newTemplate;
		}
		
		template = template.trim().replace(/ /g, '&nbsp;')
		template = template.trim().replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/\n/g, '<br />');
		
        var html = '<div id="tableDescContent_{vhostId}" class="vhostDetails">\
                    <ul class="tabs"> \
                        <li class="tab first">{configLabel}</li>'
        				.substitute({'vhostId': vhostInfo.id, 'configLabel': _t('Details')});
        if (servers.length > 1) {
		   	html += '<li class="tab">{serversLabel}</li> '.substitute({'serversLabel': _t('Servers')});
        }
        if (applications.length > 0) {
        	html += '<li class="tab">{appsLabel}</li>'.substitute({'appsLabel': _t('Applications')});
        }
        html += '</ul>';
        html += '<div class="content content-labels-values">';
        
        var type = _t('Zend Server defined');
        if (! vhostInfo.zendDefined) {
        	type = _t('System defined');
        }
        
        html += '<div><label>{typeLabel}</label><span>{type}</span></div>'.substitute({'type': type, 'typeLabel': _t('Type:')}); 
        html += '<div><label>{createdAtLabel}</label><span>{createdAt}</span></div>'.substitute({'createdAt': formatDate(vhostInfo.createdTimestamp), 'createdAtLabel': _t('Created at:')}); 
        html += '<div><label>{docRootLabel}</label><code class="systemText">{docRoot}</code></div>'.substitute({'docRoot': docroot, 'docRootLabel': _t('Document Root:') });
        
        if (vhostInfo.ssl) {
        	html += '<div><label>{sslLabel}</label><span>{type}</span></div>'.substitute({'type': _t('SSL enabled'), 'sslLabel': _t('Security:')});
        	if (certificatePath != null && certificatePath != '') {
        	html += '<div><label>{certificatePathLabel}</label><code>{certificatePath}</code></div>'.substitute({'certificatePathLabel': _t('Certificate File Path'), 'certificatePath': certificatePath.htmlEntities()});
        	}
        	if (certificateKeyPath != null && certificateKeyPath != '') {
        	html += '<div><label>{certificateKeyPathLabel}</label><code>{certificateKeyPath}</code></div>'.substitute({'certificateKeyPathLabel': _t('Key File Path'), 'certificateKeyPath': certificateKeyPath.htmlEntities()});
        	}
        	if (certificateChainPath != null && certificateChainPath != '') {
        		html += '<div><label>{certificateChainPathLabel}</label><code>{certificateChainPath}</code></div>'.substitute({'certificateChainPathLabel': _t('Chain File Path'), 'certificateChainPath': certificateChainPath.htmlEntities()});
        	}
        	if (certificateAppName != null && certificateAppName != '') {
        		html += '<div><label>{certificateAppNameLabel}</label><code>{certificateAppNamePath}</code></div>'.substitute({'certificateAppNameLabel': _t('Certificate Application Name'), 'certificateAppNamePath': certificateAppName.htmlEntities()});
        	}
        }
        
        if (template.trim() != '') {
        	html += '<div><label>{templateLabel}</label><br/><div class="templateTextarea">{template}</div></div>'.substitute({'template': template, 'templateLabel': _t('Configuration Template:')}); 
        }
        
        html += '</div>';

        if (servers.length > 1) {
        	html += this._prepareServers(servers, vhostInfo.id);
        }
        
        
        if (applications.length > 0) {
        	html += this._prepareApplications(applications, vhostInfo.id);
        }
        
        html += '</div>';
		return html;
		
	},
	
        
		_prepareUrl: function (url) {
			var link = url;
        	
        	var parser = new URI(url);
        	if (parser.get('host') == '<default-server>') {
        		parser.set('host', this.options.host);
			}
        	
        	if (parser.get('port') == 80) {
				parser.set('port', '');
			}
        	
        	link = parser.toString();
            var elem = new Element('div');
    		elem.set('text', link);
            url = elem.get('html');
            
            return '<a href="' + link + '" target="_blank">' + url + '</a>';
	    },
	    
        setServerIcon: function(serverData) {
        	var statusImage = '<img src="' + baseUrl() + '/images/apps-status-ok.png"  title="' + _t('OK') + '" />';
    		if (serverData.status.toLowerCase() == 'error') {
    			statusImage = '<img src="' + baseUrl() + '/images/apps-status-warning.png"  title="' + _t('Error') + '" />';
    		} else if (serverData.status.toLowerCase() != 'ok') {
    			statusImage = '<img src="' + baseUrl() + '/images/apps-status-warning.png"  title="' + _t('Warning') + '" />';
    		}
    		return statusImage;
        },
        
        _prepareApplications: function (applications, vhostId) {
        	var applicationsHTML = '<div id="vhostApplicationsList_'+vhostId+'" class="content vhostsSubList">';
        	
        	applicationsHTML += '<table class="tableWithDesc">';
        	applicationsHTML +=  '<tr>';
        	
        	applicationsHTML +=  '<th>{name}</th> \
        		<th>{baseUrl}</th> \
        		<th>{installedPath}</th> \
        </tr> \ '.substitute({'name': _t('Name'), 'baseUrl': _t('Base URL'), 'installedPath': _t('Location')}); 
        	
        	Object.each(applications, function(appdata){
        		applicationsHTML +=  '<tr id="appRow_{vhostId}_{id}" class="applicationRow">'.substitute({'vhostId': vhostId, 'id': appdata.applicationId});
        		applicationsHTML += '<td class="applicationRow-name">{appName}</td> \
					       		<td class="applicationRow-baseUrl">{baseUrl}</td> \
        						<td class="applicationRow-installedLocation">{installedLocation}</td> \
				            </tr>'.substitute({
				            	'appName': appdata.userApplicationName ? appdata.userApplicationName.htmlEntities() : appdata.applicationName.htmlEntities(),
		            			'baseUrl': this._prepareUrl(appdata.baseUrl),
		            			'installedLocation': appdata.installedLocation
				            });
        	}.bind(this));
        	
        	applicationsHTML += '</table>';
        	
        	applicationsHTML += '</div>';
        	return applicationsHTML;
        },
        _prepareUrl: function (url) {
        	var link = url;
        	
        	var parser = new URI(url);
        	if (parser.get('host') == '<default-server>') {
        		parser.set('host', this.options.host);
			}
        	
        	if (parser.get('port') == 80) {
				parser.set('port', '');
			}
        	
        	link = parser.toString();
            var elem = new Element('div');
    		elem.set('text', link);
            url = elem.get('html');
            
            return '<a href="' + link + '" target="_blank">' + url + '</a>';
	    },
        _prepareServers: function (servers, vhostId) {
        	serversHTML = '<div id="vhostServersList_'+vhostId+'" class="content vhostsSubList"><table class="tableWithDesc">';
        	serversHTML +=  '<tr>';
        	
        	// Only if the list more than 1 server show the redeploy option
        	if (Object.getLength(servers) != 1) {        		
        		serversHTML += '<th>{shown}: {serversCount}</th>'.substitute({'shown': _t('Shown'), 'serversCount': Object.getLength(servers)});
        	}
        	
        	serversHTML +=  '<th>{name}</th> \
        		<th>{messages}</th> \
        </tr> \ '.substitute({'name': _t('Name'), 'messages': _t('Messages')}); 
        	
        	Object.each(servers, function(serverData, id){
        		serversHTML +=  '<tr id="serverRow_{vhostId}_{id}" class="serverRow">'.substitute({'vhostId': vhostId, 'id': id});
        		serversHTML += '<td class="serverRow-icon statusImage">{icon}</td> \
					            <td class="serverRow-name">{serverName}</td> \
					       		<td class="serverRow-messages">{messages}</td> \
				            </tr>'.substitute({'icon': this.setServerIcon(serverData),
				            	'serverName': serverData.name,
				            	'messages': this.serverMessage(serverData)});
        	}.bind(this));
        	
        	serversHTML += '</table>';
        	serversHTML += '</div>';
        	return serversHTML;
        },
       
    serverMessage: function(serverData) {
    	if (! serverData.lastMessage) {
    		if (serverData.status.toLowerCase() == 'pendingrestart') {
    			return _t('This virtual host\'s configuration will only be applied once the Web server is restarted');
    		} else if (serverData.status.toLowerCase() == 'deploymentnotenabled') {
    			return _t('Enable deployment configuration has not been applied on this virtual host');
    		} else if (serverData.status.toLowerCase() == 'modified') {
    			return _t('The virtual host\'s configuration was manually modified'); 
    		}
    		return '';
    	} else if (typeof serverData.lastMessage == 'Object') {
    		if (serverData.lastMessage.details) {
    			return this.messageFormat(serverData.lastMessage.details);
    		} else if (! vhost.zendDefined) {
    			return _t('This system virtual host is not present on this server. Add the missing configuration details manually to your Web server configuration to correct this issue.'); 
    		} else {
    			return _t('This virtual host is not configured on this server'); 
    		}
		} else {
			if (['error','warning'].contains(serverData.status.toLowerCase())) {
				return serverData.lastMessage;
			}
    		return this.messageFormat(serverData.lastMessage);
    	}
    },
	clean: function(value) {
		var cleaner = new Element('div');
		cleaner.set('text', value);
		
		return cleaner.get('html');
	},
	
	getCount: function(value) {
		if (value > 1000) {
			value = Math.floor(value / 1000) + "k";
		}
		return '<div class="issues-count-wrapper"><div class="issues-count">' + value + '</div></div>';
	},
	
	messageFormat: function(string) {
	    return (string + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
	}
});