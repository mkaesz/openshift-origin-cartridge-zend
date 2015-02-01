var monitorIssueList = new Class({
	Implements: [Events,Options],
	
	issuesResponse: null,
	totalCount: null,
	issues: null,
	page: 0,
	countRequest: null,
	getOptions: function(){
		return {
			eventInfo:		null,
			pager:			null,
			isCollectEventsCodeTraceAllowed: null,
			allowedDelete:	true
		};
	},

	initialize: function(options) {
		this.setOptions(this.getOptions(), options);
		this._initGrid();
	},
	
	deleteFiltered: function() {	
		if (! this.options.allowedDelete) {
			return ;
		}
		
		var issue = this.options.pager.totalItems > 1 ? 'issues (' + this.options.pager.totalItems + ')': 'issue';

		if (! confirm(_t("Are you sure you would like to delete the currently filtered " + issue + "?"))) {
			return;
		}
		
		if ($('delete')) {
			$('delete').spinner.show();
		}
		
		var params = {"filters":filterWidget.selectedFilters};
  		var request = new Request.WebAPI({url: baseUrl() + '/Api/monitorDeleteIssuesByPredefinedFilter', data: params});

  		request.addEvent("complete", this.deleteDone);
  		request.post();
	},
	
	deleteSelected: function() {
		if (! this.options.allowedDelete) {
			return ;
		}
		
		var issue = Object.keys(zgrid2.getSelectedRows()).length > 1 ? 'issues (' + Object.keys(zgrid2.getSelectedRows()).length + ')': 'issue';

		if (! confirm(_t("Are you sure you would like to delete the currently selected " + issue + "?"))) {
			return;
		}
		
		if ($('delete')) {
			$('delete').spinner.show();
		}

		var params = {"issuesIds":Object.keys(zgrid2.getSelectedRows()), "filters":filterWidget.selectedFilters};		
  		var request = new Request.WebAPI({url: baseUrl() + '/Api/monitorDeleteIssues', data: params});

  		request.addEvent("complete", this.deleteDone);
  		request.post();
	},
	
	deleteDone: function(data) {
		$('delete').spinner.hide();
		$('delete').set('disabled', true);
		
		if (data) {
			document.fireEvent('toastNotification', {'message': _t("Monitor issues have been deleted")});
		} else {
			document.fireEvent('toastAlert', {'message': _t('Failed to delete the monitor issues')});
		}

	   rowsChecked = 0;
	   zgrid2.loadData();
	},

	checkItemes: function() {
		if (! this.options.allowedDelete) {
			$('delete-filtered').set('disabled', true);
			return ;
		}
		
		if (this.options.pager.totalItems > 0) {
			$('delete-filtered').set('disabled', false);
		} else {
			$('delete-filtered').set('disabled', true);
		}
	},
	
	gridDataReady: function() {
		if (this.issues != null && this.totalCount != null) {
			zgrid2.setData(this.issues,this.totalCount);
			this.options.pager.reloadData(this.page, this.totalCount);
			this.checkItemes();
			changeLimitedMessageColor(this.issues.length);
		}
	},
	
	_initGrid: function() {
		filterWidget.addEvent('saveFilter', function(data) {
        	document.fireEvent('toastNotification', {'message': _t("Filter '{filterName}' was saved", {'filterName': data.filterName})});
        });

		filterWidget.addEvent('saveFilterFailed', function(data) {
        	document.fireEvent('toastAlert', {'message': _t("Could not save filter: {errorMessage}", data.errorData)});
        });

		filterWidget.addEvent('deleteFilter', function(event){
        	document.fireEvent('toastNotification', {'message': _t("Filter '{filterName}' was deleted", {'filterName': event.filterName})});
		});
		
		filterWidget.addEvent('deleteFilterFailed', function(event){
        	document.fireEvent('toastNotification', {'message': _t("Filter '{filterName}' was not deleted: {errorMessage}", {'filterName': event.filterName, 'errorMessage': event.errorData.errorMessage})});
		});
    	
		filterWidget.addEvent('loadItemDetails', function(event){
			new Request.WebAPI({
				url: baseUrl() + '/Api/monitorGetIssueDetails',
				onSuccess: function(response){
					(baseUrl() + '/Issue?issueId=' + event.query).toURI().go(); 
				},
				onFailure: function(response){
					filterWidget.selectSearchFilter(event.query, 'freeText', 'search', 'freeText');
					filterWidget.addToSearchFiltering('freeText', event.query);
					filterWidget.runFiltering();
				}
			}).get({'issueId': event.query});
		});
    	
    	persistantHeaders.addHeader('mytable_tableHead');

    	filterWidget.addEvent('runFiltering',function(selectedFilters) {
    		zgrid2.loadData();
	   	}.bind(this));

		this.loadRequest = new Request.WebAPI({
			method: 'get',
			url: baseUrl() + '/Api/monitorGetIssuesByPredefinedFilter', 
			link: 'cancel',
			onSuccess: function(response) {
				this.issues = response.responseData.issues;
				this.gridDataReady();
			}.bind(this),
			onFailure: function(response) {
				var response = JSON.decode(response.responseText);
				document.fireEvent('toastAlert', {'message': response.errorData.errorMessage});
				zgrid2.postLoad();
				zgrid2.setData([], 0);
				this.options.pager.reloadData(1, 0);
			}.bind(this)
		})
    	
		this.countRequest = new Request.WebAPI({
			method: 'get',
			link: 'cancel',
			url: baseUrl() + '/Api/monitorCountIssuesByPredefinedFilter', 
			onSuccess: function(response) {
				this.totalCount = response.responseData.issuesCount;
				this.gridDataReady();
			}.bind(this),
			onFailure: function(response) {
				var response = JSON.decode(response.responseText);
				document.fireEvent('toastAlert', {'message': response.errorData.errorMessage});
				zgrid2.postLoad();
				zgrid2.setData([], 0);
				this.options.pager.reloadData(1, 0);
			}.bind(this)
		})
		
    	////////////// GRID EVENTS //////////////
    	zgrid2.addEvent('loadData', function(params) {
    		zgrid2.preLoad();
    	        	
        	params.filterId = 'dummy';
        	params.filters = filterWidget.selectedFilters;
        	this.page = params.page;
        	this.totalCount = null;
        	this.issues = null;
        	
        	// send two requests async for faster response
        	
        	this.loadRequest.get(params);
    		
    		// send request only with total count
        	this.countRequest.get(params);
    		
    	}.bind(this));

    	zgrid2.addEvent('descriptionOpen',function(params) {
    		this.options.eventInfo.loadData(params);
    	}.bind(this));

    	this.options.pager.addEvent('pageSelect',function(params) {
    		zgrid2.reloadData(params);
    	}.bind(this));

    	zgrid2.addEvent('rowChecked',function(params) {
    		if (params.checked) {
    			if (rowsChecked == 0 && this.options.allowedDelete) {
    				if ($('delete')) {
    					$('delete').set('disabled', false);
    			    }
    			}
    	    	rowsChecked++;
    		} else {
    			rowsChecked--;
    		    if (rowsChecked == 0) {
    		    	if ($('delete')) {
    		    		$('delete').set('disabled', true);
    		    	}
    		    }
    		}
    	});
    	    	   	        
    	// last line
    	zgrid2.tableSpinner.show();
    	filterWidget.runFiltering();
		       	    
    	this.checkItemes();

    	if ($('delete') && typeof $('delete').spinner == 'undefined') {
    		$('delete').spinner = new Spinner();
    		$('delete').spinner.hide();
    	}
	},
	
	//////////////GRID CALLBACKS //////////////
	eventSeverity: function(value, data) {
	   	var divClass = '';
	    switch (value) {
	       	case 'Warning':
	    		divClass = 'severity-warning';
	    		divTitle = 'Warning';
	       		break;
	    	case 'Critical':
	    		divClass = 'severity-error';
	    		divTitle = 'Critical';
	       		break;
	    	case 'Info':
	       	default:
	    		divClass = 'severity-info';
    			divTitle = 'Notice';
	       		break;
	    }
	    
    	return '<div class="' + divClass + '" title="' + divTitle + '"></div>';
  	},
  	
  	eventCount: function(value, data) {
   		var shortValue = value;
    	if (value > 1000) {
        	shortValue = Math.floor(value / 1000) + "k";
    	}
    	return '<div class="issues-count-wrapper"><div class="count-icon" title="' + value + '">' + shortValue + '</div></div>';
  	},
  	
  	eventId: function(value, data) {
	    return '<a href="' + baseUrl() + '/Issue?issueId=' + value + '" title="' + _t("Display event details") + '">' + value + '</a>';
	},
  	
  	eventAppName: function(value, data) {
   		if (value == "") {
        	return value;
    	}

   		var wrapper = new Element('span');
   		var text = new Element('span', {'text': value});
   		wrapper.adopt(text);
    	return '<img src="' + baseUrl() + '/IssueList/App-Icon/?id=' + data.appId + '" class="tableRow_app_icon" /> ' + wrapper.get('html');
  	 },

	summary: function(value, data) {
		var summary = monitorIssueList.prototype.whatHappened(value, data);

		if (data.routeDetails) {
			summary += ' at ' + data.routeDetails;
		}

		return summary;
	},
	
	codeTracingLink: function(value, data) {
		if (! value) {
			return '';
		}
		
		if (! issueList.options.isCollectEventsCodeTraceAllowed) {
			var href = "javascript:void(0)";
			var title = _t('Collecting the Code Traces in the Events is not supported');
		} else {
			var href = baseUrl() + '/CodeTracing/details/?eventsGroupId=' + value;
			var title="Code Trace";
		}
		return '<a title="' + title + '" href="' + href +'">show</a>';
	},
	
	whatHappened: function(value, data) {
			var eventType = data.eventType.toInt();

			switch (eventType) {
				case 0: // ZM_TYPE_CUSTOM
					return monitorIssueList.prototype.clean('Custom event triggered from ' + data.generalDetails.sourceFile);
				case 1: // ZM_TYPE_FUNCTION_SLOW_EXEC
					return monitorIssueList.prototype.clean('Function ' + data.generalDetails.function + '() took ' + value.execTime + 'ms');
				case 2: // ZM_TYPE_FUNCTION_ERROR
					return monitorIssueList.prototype.clean('Function ' + data.generalDetails.function + '() returned false');
				case 3: // ZM_TYPE_REQUEST_RELATIVE_SLOW_EXEC, ZM_TYPE_REQUEST_SLOW_EXEC
	  				if (value.relExecTime > 0) {// REL
	  	  				return monitorIssueList.prototype.clean('Request to ' + data.generalDetails.url + ' took ' + Math.round(value.relExecTime) + '% more than normal');
	  				}else { // ABS
	  	  				return monitorIssueList.prototype.clean('Request to ' + data.generalDetails.url + ' took ' + value.execTime + 'ms');
	  				}  							
				case 4: // ZM_TYPE_REQUEST_RELATIVE_LARGE_MEM_USAGE, ZM_TYPE_REQUEST_LARGE_MEM_USAGE
	  				if (value.relMemUsage > 0) {// REL
	  	  				return monitorIssueList.prototype.clean('Request to ' + data.generalDetails.url + ' consumed ' + Math.round(value.relMemUsage) + '% more than normal');
	  				}else { // ABS
	  	  				return monitorIssueList.prototype.clean('Request to ' + data.generalDetails.url + ' consumed ' + value.memUsage + 'KB');
	  				}  	
				case 5: // ZM_TYPE_REQUEST_RELATIVE_LARGE_OUT_SIZE
					return monitorIssueList.prototype.clean('Request to ' + data.generalDetails.url + ' generated output of ' + Math.round(value.relOutputSize) + '% more than normal');
				case 6: // ZM_TYPE_ZEND_ERROR
					return monitorIssueList.prototype.clean('Function ' + data.generalDetails.function + '() caused a ' + data.generalDetails.errorType + ' PHP error');
				case 7: // ZM_TYPE_JAVA_EXCEPTION
					return monitorIssueList.prototype.clean('Function ' + data.generalDetails.function + '() caused a Java Exception');
				case 8: // ZM_TYPE_JQ_JOB_EXEC_ERROR
					return monitorIssueList.prototype.clean('Job execution of ' + data.generalDetails.url + ' ended with error');
				case 9: // ZM_TYPE_JQ_JOB_LOGICAL_FAILURE
					return monitorIssueList.prototype.clean('Job execution of ' + data.generalDetails.url + ' ended with logical error');
				case 10: // ZM_TYPE_JQ_JOB_EXEC_DELAY
					return monitorIssueList.prototype.clean('Job execution of ' + data.generalDetails.url + ' is delayed');
				case 12: // ZM_TYPE_TRACER_FILE_WRITE_FAIL
					return monitorIssueList.prototype.clean('Failed to write codetrace');// would have been nice to show related data (filename and error), but we don't have this data here 
				default:
					return monitorIssueList.prototype.clean("Unknown event type '" + eventType + "'");
			}
	},
	
	clean: function(value) {
		var cleaner = new Element('div');
		cleaner.set('text', value);

		return cleaner.get('html');
	}
});