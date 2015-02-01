var zgridServerDetails = new Class({
	Implements: [Events,Options],
	
	currentRow: '',
	currentId: 	0,
	spinner:	false,
	reload:		false,
	
	getOptions: function(){
		return {
			url: null
		};
	},
	
	initialize: function(options){
		this.setOptions(this.getOptions(), options);
	},
	
	onLoadData: function (data)
	{
		if (data) {
			var rowContent = this.getRow(data.responseData);
			$(this.currentRow).set('html', rowContent);
			
			var descContentDiv = $(this.currentRow).getElement('div');
			
			if (! this.reload) {
				var myVerticalSlide = new Fx.Slide(descContentDiv, {
					onComplete: function(){
						$(zgrid2.options.tableDescContent + this.currentId).spinner = new Spinner($(zgrid2.options.tableDescContent + this.currentId));
						if (this.spinner) {
							$(zgrid2.options.tableDescContent + this.currentId).spinner.show();
						}
				    }.bind(this)
				});
				myVerticalSlide.hide();
				myVerticalSlide.slideIn();
			} else {
				this.reload = false;
			}
		}
	},
	
	loadData: function(data)
	{
		if (!this.options.url)
			return;
		
		this.currentId = data.id;
		this.currentRow = data.rowId;
		if (data.spinner) {
			this.spinner = data.spinner;
		} else {
			this.spinner = false;
		}

		var params = {
			servers: [data.id]
		};
		
		var request = new Request.WebAPI({url: this.options.url, data:params});

		request.addEvent("complete", this.onLoadData.bind(this) ) ;

		request.get();
	}, 
	
	showSpinner: function(rowId) {
		$(zgrid2.options.tableDescContent + rowId).spinner.show();
	},
	
	hideSpinner: function(rowId) {
		$(zgrid2.options.tableDescContent + rowId).spinner.hide();
	},
	
	reloadData: function(data) {
		this.reload = true;
		this.loadData(data);
	},
	
	getRow: function(data) {
		var server = data.serversList[0];
		
		var template = '<div class="tableDescContent" id="tableDescContent_' + this.currentId + '">';
		
		var counter = 0;
		
		var parent = this;
		
		if (server.messageList.length == 0) {
			template += _t('No errors found');
		} else {
			template += '<ul>';
			server.messageList.each(function(item) {
				var key = Object.keys(item)[0];
				template += '<li>' + item[key] + '</li>';
			}.bind(this));
			template += '</ul>';
		}
		
		
		template += '<div class="clear"></div></div>';
		
		return template;
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
	
	getFieldName: function(fieldType) {
		switch (fieldType) {
			case 'url': return 'URL';
			case 'function': return 'Function name';
			case 'customEventClass': return 'Class Name (custom)';
			case 'errorType': return 'Error Type';
			case 'sourceFile': return 'Source file';
			case 'errorString': return 'Error string';
			default: return '';
		}
	},
	
	getFields: function(eventType) {
		eventType = parseInt(eventType);
		switch (eventType) {
			case 0: // ZM_TYPE_CUSTOM
				return new Array('url', 'customEventClass', 'sourceFile', 'errorString');
			case 3: // ZM_TYPE_REQUEST_SLOW_EXEC
			case 4: // ZM_TYPE_REQUEST_RELATIVE_SLOW_EXEC
			case 5: // ZM_TYPE_REQUEST_LARGE_MEM_USAGE
			case 6: // ZM_TYPE_REQUEST_RELATIVE_LARGE_MEM_USAGE
			case 7: // ZM_TYPE_REQUEST_RELATIVE_LARGE_OUT_SIZE
				return new Array('url');
			case 2: // ZM_TYPE_FUNCTION_ERROR
			case 1: // ZM_TYPE_FUNCTION_SLOW_EXEC
				return new Array('url', 'function', 'sourceFile');
			case 8: // ZM_TYPE_ZEND_ERROR
				return new Array('url', 'function', 'errorType', 'sourceFile', 'errorString');
			case 9: // ZM_TYPE_JAVA_EXCEPTION
				return new Array('url', 'function', 'sourceFile', 'errorString');
			case 10: // ZM_TYPE_JQ_JOB_EXEC_ERROR
			case 11: // ZM_TYPE_JQ_JOB_LOGICAL_FAILURE
			case 12: // ZM_TYPE_JQ_JOB_EXEC_DELAY
			case 13: // ZM_TYPE_JQ_DAEMON_HIGH_CONCURRENCY_LEVEL
				return new Array('url');
			case 14: // ZM_TYPE_TRACER_FILE_WRITE_FAIL
				return new Array();
			case 16: // ZM_TYPE_ZSM_CONFIGUATION_MISMATCH
			case 17: // ZM_TYPE_ZSM_NODE_ADDED_SUCCESSFULLY
			case 19: // ZM_TYPE_ZSM_NODE_IS_NOT_RESPONDING
			case 18: // ZM_TYPE_ZSM_NODE_REMOVED_SUCCESSFULLY
			case 20: // ZM_TYPE_ZSM_NODE_DISABLED_SUCCESSFULLY
			case 21: // ZM_TYPE_ZSM_NODE_ENABLED_SUCCESSFULLY
			case 15: // ZM_TYPE_ZSM_RESTART_FAILED
				return new Array();
			case 24: // ZM_TYPE_DEPL_APP_DEPLOYED_ERROR
			case 23: // ZM_TYPE_DEPL_APP_DEPLOYED_SUCCESSFULLY
			case 28: // ZM_TYPE_DEPL_APP_REMOVED_ERROR
			case 27: // ZM_TYPE_DEPL_APP_REMOVED_SUCCESSFULLY
			case 26: // ZM_TYPE_DEPL_APP_RE_DEPLOYED_ERROR
			case 25: // ZM_TYPE_DEPL_APP_RE_DEPLOYED_SUCCESSFULLY
			case 30: // ZM_TYPE_DEPL_APP_UPDATE_ERROR
			case 29: // ZM_TYPE_DEPL_APP_UPDATE_SUCCESSFULLY
			case 32: // ZM_TYPE_DEPL_APP_ROLLBACKED_ERROR
			case 31: // ZM_TYPE_DEPL_APP_ROLLBACKED_SUCCESSFULLY
				return new Array('url');
			default:
				return new Array('url', 'function', 'errorType', 'sourceFile', 'errorString');
		}
	}
});