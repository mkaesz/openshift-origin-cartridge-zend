var zgridApplicationInfo = new Class({
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
	
	onLoadData: function (data, response)
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
                        
			var myVerticalSlide = new Fx.Slide('tableDescContent_' + data.id, {resetHeight: true});
			myVerticalSlide.hide();
			myVerticalSlide.slideIn();
		}
	},
	
	reloadData: function(data) {
		this.reload = true;
		this.loadData(data);
	},
	
	loadData: function(data)
	{
		// if data already loaded - just show them
		if (! this.reload && $('tableDescContent_' + data.id).get('html') != '') {
			var myVerticalSlide = new Fx.Slide('tableDescContent_' + data.id, {resetHeight: true});
			myVerticalSlide.hide();
			myVerticalSlide.slideIn();
			return;
		}
		
		if (this.reload) {
			this.reload = false;
		}
		
		if (!this.options.url)
			return;
		
		var params = {
			application: data.id
		};
		
		var request = new Request.WebAPI({url: this.options.url, data:params});

		request.addEvent("complete", this.onLoadData.bind(this, data));

		request.get();
	}, 
	
	hideUserParams:function() {
		this.showUserParams = false;
	},
	
	getRow: function(data) {
            var applicationInfo = data.applicationDetails.applicationInfo;
            var applicationPackage = data.applicationDetails.applicationPackage;
            var servers = data.applicationDetails.servers;
            
            var errorTabTitle = '';
            var errorTabContent = '';

            if(applicationInfo.status.test('error', ['i']) && (0 < applicationInfo.messageList.length)){
				var errorTabTitle = '<li class="tab">' + _t('Error') + '</li>';
                var result = '<h4>' + applicationInfo.messageList[0].type + ':</h4>&nbsp;<span>' + this.messageFormat(applicationInfo.messageList[0].message) + '</span>';
    			var errorTabContent = '<div class="content">' + result + '</div>';
    		}
            
            var prerequisitesExists = false;
            
            if (applicationPackage.prerequisites != '' && applicationPackage.prerequisites != '<dependencies></dependencies>') {
            	prerequisitesExists = true;
            }
            
            
            var prerequisites = '<div class="content prerequisites_container" id="prerequisites_' + applicationInfo.id + '"></table></div>';
            
            var userParams = this._prepareUserParams(applicationPackage.userParams);
            var serversHTML = '';
            var serversLi = '';
            if (Object.keys(data.applicationDetails.servers).length > 0) {
            	serversLi = '<li class="tab">Active Servers</li> \ ';
            	serversHTML = this._prepareServers(data.applicationDetails.servers, applicationInfo.id);
            }

            var html =
                    '<div id="tableDescContent_' + applicationInfo.id + '" class="appDetails">\
                        <ul class="tabs"> \
                                    '+ errorTabTitle +' \
                            <li class="tab first">Details</li>';
            if (userParams) {
            	html += '<li class="tab">User Parameters</li>';
            }
            
            if (prerequisitesExists) {
            	html += '<li class="tab" onclick="getApplicationPrerequisites(\'' + applicationInfo.id + '\');">Prerequisites</li>';
            }
            
            html += serversLi + ' \
                        </ul> \
                        ' + errorTabContent +' \
                        <div class="content"> \
                                    <table class="tableWithDesc"> \
                                            <tr> \
                                                    <td>Base URL</td> \
                                                    <td>' + this._prepareUrl(applicationInfo.baseUrl) + '</td> \
                                            </tr> \
                                            <tr> \
                                                    <td>Application</td> \
                                                    <td>' + applicationInfo.appName  + '</td> \
                                            </tr> \
                                            <tr> \
                                                    <td>Version</td> \
                                                    <td>' + applicationInfo.deployedVersions.deployedVersion + '</td> \
                                            </tr> \
                                            <tr> \
                                                    <td>Deployed On</td> \
                                                    <td>' + formatDate(applicationInfo.creationTimeTimestamp) + '</td> \
                                            </tr> \
                                    </table> \
                            <div class="details-column"> \
                                            <span class="more-details"><a href="'+ baseUrl() +'/IssueList#applicationIds='+applicationInfo.id +'">See Monitoring Data</a></span><br /> \
                                            <span class="more-details"><a href="'+ baseUrl() +'/MonitorRules#grid=app_'+applicationInfo.id +'&global=' + applicationInfo.id.replace('app_', '') + '">Configure Monitoring Rules</a></span><br /> \
                                            <span class="more-details"><a href="'+ baseUrl() +'/PageCache/#grid=app_'+applicationInfo.id +'">Configure Caching Rules</a></span><br /> \
                                    </div> \
                            <img src="/ZendServer/IssueList/App-Icon?id=' + applicationInfo.id + '" class="app-details-logo"> \
                        </div>';
            if (userParams) {
            	html += '<div class="content"> \
                            <table class="tableWithDesc"> \
                                    ' + userParams + ' \
                            </table> \
                        </div>';
            }
            
            if (prerequisitesExists) {
            	html += prerequisites;
            }
            
            html += serversHTML + ' \
                    </div>';
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
        
        toggleRedeploy: function (inputCheckbox) {
        	var redeployButtonEnabled = false;
        	var parentId = inputCheckbox.parentNode.id;
        	
        	if(inputCheckbox.checked) {
        		$('redeployButton_' + parentId).disabled = false;
        		redeployButtonEnabled = true;
        	} else {
        		$$('input[type="checkbox"]').each(function(element) {
        			if (element.checked) {
        				$('redeployButton_' + parentId).disabled = false;
        				redeployButtonEnabled = true;
        			}
        		}.bind(this));
        	}
        	
        	if(!redeployButtonEnabled) {
        		$('redeployButton_' + parentId).disabled = true;
        	}
        },
        setServerIcon: function(serverData) {
        	var statusImage = '<img src="' + baseUrl() + '/images/apps-status-ok.png"  title="' + _t('OK') + '" />';
    		if (serverData.status != 32 || serverData.healthStatus == 82) {
    			statusImage = '<img src="' + baseUrl() + '/images/apps-status-warning.png"  title="' + _t('Warning') + '" />';
    		}
    		return statusImage;
        },
        endRedeploy: function(applicationInfoId, appData){
        	var params = {
    			application: applicationInfoId
    		};
    		
    		var request = new Request.WebAPI({url: this.options.url});
    		request.addEvent("success", this.loadServerStates.bind(this, appData));
    		request.get(params);
    		
        	
        },
        loadServerStates: function(application, response) {
        	Object.each(response.responseData.applicationDetails.servers, function(server){
        		$$('#serverRow_'+application.id+'_'+server.NODE_ID+' .statusImage').set('html', this.setServerIcon(server));
        	}.bind(this));
        },
        redeployStartForApplication: function(appId) {
        	if ($('appServersList_' + appId)) {
        		$('appServersList_' + appId).getElements('.serverRow img')
        		.set('src', baseUrl()+'/images/preload-16.gif')
        		.set('title', _t('Redeploying ...'));
        	}
        },
        redeploy: function(applicationInfoId) {
        	
        	var serverIds = [];
        	
        	// get checked servers to redeploy
        	$$('td[id="' + applicationInfoId + '"] input[type="checkbox"]').each(function(element) {
    			if (element.checked) {
    				appsDataPolling.setTask(applicationInfoId, 'redeploy');
    				serverIds.push(element.id);
    				$('serverRow_' + applicationInfoId+'_'+element.id).getElements('img')
    					.set('src', baseUrl()+'/images/preload-16.gif')
    					.set('title', _t('Redeploying ...'));
    			}
    		}.bind(this));
        	
        	if (serverIds.length == 0) { 
        		document.fireEvent('toastAlert', {'message': _t("No server was selected to redeploy")});
        		return;
        	}
        	
        	// Synchronize application
           	var params = {
           		appId: applicationInfoId,
           		servers: serverIds
           	};

           	var actionUrl = baseUrl() + '/Api/applicationSynchronize';

        	var request = new Request.WebAPI({url: actionUrl, data:params, method: 'post',
        	onSuccess: function(response) {
        		document.fireEvent('toastNotification', {'message': _t("Redeploying application...")});
    		},
    		onFailure: function() {
    			document.fireEvent('toastAlert', {'message': _t("Failed to synchronize the application")});
    		}});
    			
            request.post();
        },
        
        _prepareServers: function (data, applicationInfoId) {
        	
        	serversHTML = '<div id="appServersList_'+applicationInfoId+'" class="content appServersList"><table class="tableWithDescServers">';
        	serversHTML +=  '<tr>';
        	
        	// Only if the list more than 1 server show the redeploy option
        	if (Object.keys(this.responseData.applicationDetails.servers).length != 1) {        		
        		serversHTML += '<th>Shown: ' + Object.keys(this.responseData.applicationDetails.servers).length + '</th>';
        	}
        	
        	serversHTML +=  '<th>!</th> \
                <th>Name</th> \
        		<th>Messages</th> \
        </tr> \ ';
        	
        	Object.each(data, function(serverData, id){
        		
        		serversHTML +=  '<tr id="serverRow_'+applicationInfoId+'_' + id +'" class="serverRow">';
        		if (Object.keys(this.responseData.applicationDetails.servers).length != 1) {
        			serversHTML += '<td id="' + applicationInfoId + '"><input type="checkbox" class="checkboxRedeploy" onclick="appInfo.toggleRedeploy(this);" id="' + id + '"></td>';
        		}
        		
        		serversHTML += '<td class="statusImage">' + this.setServerIcon(serverData) + '</td> \
					            <td style="width: 200px">' + serverData.serverName + '</td> \
					       		<td style="white-space: normal;">' + serverData.messages + '</td> \
				            </tr>';
        	}.bind(this));
        	
        	serversHTML += '</table>';
        	if (Object.keys(this.responseData.applicationDetails.servers).length != 1) {
        		serversHTML += '<div><button disabled="" title="Redeploy application" onclick="appInfo.redeploy(' + applicationInfoId + ')" class="redeployButton" id="redeployButton_' + applicationInfoId + '">Redeploy</button></div>';
        	}
        	serversHTML += '</div>';
        	return serversHTML;
        },
        
        _prepareUserParams: function (data) {
            if(data == '' || !this.showUserParams){
                    return '';
            }

            var result = '';
            for(var i in data) {
                    var value = data[i];
                    result += '<tr>';
                    result += '<td>' + i + ':</td><td>'  + htmlEntities(value) + '</td>';
                    result += '</tr>';
            }

            return result;
        },
        
        _makeList: function (data) {

            var result = '<ul class="prerequisites-list">';
            
            Object.each(data, function (message, element) {
            		result += '<li class="' + (message.isValid != 'true' ?  'prerequisite-item-error' : 'prerequisite-item-valid') + '">';
            		result += '<span>' + message.message + '</span>';
            		result += '</li>';
            })
            
            return result;
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