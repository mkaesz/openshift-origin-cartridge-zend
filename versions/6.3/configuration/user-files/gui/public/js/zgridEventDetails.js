var zgridEventDetails = new Class({
	Implements: [Events,Options],
	
	prefix: '',
	
	getOptions: function(){
		return {
			url: null,
			maxServers: 3
		};
	},
	
	initialize: function(options){
		this.setOptions(this.getOptions(), options);
	},
	
	onLoadData: function (data, response)
	{		
		if (response) {
			var rowContent = this.getRow(response.responseData);
		
			$(data.rowId).set('html', rowContent);
                        
			var myVerticalSlide = new Fx.Slide('tableDescContent_' + data.id);
			myVerticalSlide.hide();
			myVerticalSlide.slideIn();
		}
	},
	
	loadData: function(data)
	{
		if (!this.options.url)
			return;
		
		this.prefix = data.prefix;

		var params = {
			issueId: data.id,
			limit:	this.options.maxServers
		};
		
		var request = new Request.WebAPI({url: this.options.url, data:params});

		request.addEvent("complete", this.onLoadData.bind(this, data) ) ;

		request.get();
	},
	
	getRow: function(data) {
		var template =
			'<div class="tableDescContent" id="tableDescContent_' + data.issue.id + '"> \
			<div class="descRight"> \
			<table>';
		
		var counter = 0;
		
		var parent = this;
		
		data.eventsGroups.some( function(item) {
			if (counter >= parent.options.maxServers) { 
				return true;
			}
			
			template += '<tr>';
			if (counter == 0) {
				template += '<td>'+_t('Servers')+'</td>'; 
			} else {
				template += '<td></td>';
			}
			
			template += '<td><div title="Server Name" style="width: 100px;" class="ellipsis_wrp">' + item.serverName + '</div></td>';
			template += '<td>' + this.getCount(item.eventsCount) + '</td>';
			
			var eventDate = formatDate(item.startTimeTimesatmp);
			template += '<td>' + eventDate + '</td>';
			template += '</tr>';
			
			counter++;
		}.bind(this));
		template += '<tr><td colspan="4"><a href="' + baseUrl() + '/Issue?issueId=' + data.issue.id + '" class="more-details" >' + _t('More Details') + '</a></td></tr>';
		template += '</table></div> \
			<div class="descLeft"> \
				<table>';
		
		var fields = new Array();
		fields = this.getFields(data.issue);
		
		if (fields.length > 0) {
			for (i = 0; i < fields.length; i++) {
				var fieldType = fields[i];
				var fieldData = this.getFieldName(fieldType);				
				var fieldName = fieldData[0];
				var fieldUnits = fieldData[1];

				var fieldValue = this.clean(this.getFieldData(fieldType, data));
				var value = fieldValue + fieldUnits;
				if (fieldType == 'url') {
					value = '<a target="_blank" href="' + fieldValue + '">' + fieldValue + '</a>';
				}
				template += '<tr> \
						<td ' + ((i == 0) ? 'style="min-width: 100px;"' : '') + '>' + fieldName + '</td> \
						<td ' + ((i == 0) ? 'style="width: 100%;"' : '') + '>' + value + '</td> \
						</tr>';
			}
		}
		
		template += '</table></div><div class="clear"></div></div>';
		
		return template;
	},
	
	getFieldData: function(field, data) {
		if (field == 'whatHappened') {
			return this.whatHappened(data.issue.whatHappenedDetails, data.issue);
		}
		
		if (data.issue.generalDetails[field] != undefined) {			
			return data.issue.generalDetails[field];
		}		

		value = data.eventsGroups[0][field];
		if (field == 'relExecTime' || field == 'relMemUsage' || field == 'relOutputSize') {
			value = Math.round(value);
		}		
		
		return value;
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
		return '<div title="Events Count" class="issues-count-wrapper"><div class="issues-count">' + value + '</div></div>';
	},
	
	getFieldName: function(fieldType) { // return name to be displayed, and also unit suffix if applicable
		switch (fieldType) {
			case 'url': return new Array('URL', '');
			case 'whatHappened': return new Array('Summary', '');			
			case 'function': return new Array('Function Name', '');
			case 'customEventClass': return new Array('Class Name (custom)', '');
			case 'errorType': return new Array('Error Type', '');
			case 'sourceFile': return new Array('Source File', '');
			case 'errorString': return new Array('Error String', '');
			case 'memUsage': return new Array('Memory Usage', 'KB');
			case 'execTime': return new Array('Execution Time', 'ms');
			case 'relExecTime': return new Array('Relative Execution Time', '%');
			case 'relMemUsage': return new Array('Relative Memory Usage', '%');
			case 'relOutputSize': return new Array('Relative Output Usage', '%');
			default: return new Array('', '');
		}
	},
	
	getFields: function(issue) {
		eventType = parseInt(issue.eventType);
		switch (eventType) {
			case 0: // ZM_TYPE_CUSTOM
				return new Array('url', 'whatHappened', 'customEventClass', 'sourceFile', 'errorString');
			case 1: // ZM_TYPE_FUNCTION_SLOW_EXEC
				return new Array('url',  'function', 'sourceFile', 'execTime');
			case 2: // ZM_TYPE_FUNCTION_ERROR
				return new Array('url',  'function', 'sourceFile');
			case 3: // ZM_TYPE_REQUEST_SLOW_EXEC, ZM_TYPE_REQUEST_RELATIVE_SLOW_EXEC
  				if (issue.whatHappenedDetails.relExecTime > 0) {// REL
  					return new Array('url',  'relExecTime');
  				}else { // ABS
  					return new Array('url',  'execTime');
  				}
			case 4: // ZM_TYPE_REQUEST_RELATIVE_LARGE_MEM_USAGE, ZM_TYPE_REQUEST_LARGE_MEM_USAGE
  				if (issue.whatHappenedDetails.relMemUsage > 0) {// REL
  					return new Array('url',  'relMemUsage');
  				}else { // ABS
  					return new Array('url',  'memUsage');
  				}  	
			case 5: // ZM_TYPE_REQUEST_RELATIVE_LARGE_OUT_SIZE
				return new Array('url',  'relOutputSize');
			case 6: // ZM_TYPE_ZEND_ERROR
				return new Array('url',  'function', 'errorType', 'sourceFile', 'errorString');
			case 7: // ZM_TYPE_JAVA_EXCEPTION
				return new Array('url',  'function', 'sourceFile', 'errorString');
			case 8: // ZM_TYPE_JQ_JOB_EXEC_ERROR
			case 9: // ZM_TYPE_JQ_JOB_LOGICAL_FAILURE
			case 10: // ZM_TYPE_JQ_JOB_EXEC_DELAY
			case 12: // ZM_TYPE_TRACER_FILE_WRITE_FAIL
				return new Array('whatHappened');
			default:
				return new Array('url',  'function', 'errorType', 'sourceFile', 'errorString');
		}
	},	

	whatHappened: function(value, data) {
		var eventType = data.eventType.toInt();
		
		switch (eventType) {
			case 0: // ZM_TYPE_CUSTOM
				return this.clean('Custom event triggered from ' + data.generalDetails.sourceFile);
			case 1: // ZM_TYPE_FUNCTION_SLOW_EXEC
				return this.clean('Function ' + data.generalDetails.function + '() took ' + value.execTime + 'ms');
			case 2: // ZM_TYPE_FUNCTION_ERROR
				return this.clean('Function ' + data.generalDetails.function + '() returned false');
			case 3: // ZM_TYPE_REQUEST_RELATIVE_SLOW_EXEC, ZM_TYPE_REQUEST_SLOW_EXEC
  				if (value.relExecTime > 0) {// REL
  	  				return this.clean('Request to ' + data.generalDetails.url + ' took ' + Math.round(value.relExecTime) + '% more than normal');
  				}else { // ABS
  	  				return this.clean('Request to ' + data.generalDetails.url + ' took ' + value.execTime + 'ms');
  				}  							
			case 4: // ZM_TYPE_REQUEST_RELATIVE_LARGE_MEM_USAGE, ZM_TYPE_REQUEST_LARGE_MEM_USAGE
  				if (value.relMemUsage > 0) {// REL
  	  				return this.clean('Request to ' + data.generalDetails.url + ' consumed ' + Math.round(value.relMemUsage) + '% more than normal');
  				}else { // ABS
  	  				return this.clean('Request to ' + data.generalDetails.url + ' consumed ' + value.memUsage + 'KB');
  				}  	
			case 5: // ZM_TYPE_REQUEST_RELATIVE_LARGE_OUT_SIZE
				return this.clean('Request to ' + data.generalDetails.url + ' generated output of ' + Math.round(value.relOutputSize) + '% more than normal');
			case 6: // ZM_TYPE_ZEND_ERROR
				return this.clean('Function ' + data.generalDetails.function + '() caused a ' + data.generalDetails.errorType + ' PHP error');
			case 7: // ZM_TYPE_JAVA_EXCEPTION
				return this.clean('Function ' + data.generalDetails.function + '() caused a Java Exception');
			case 8: // ZM_TYPE_JQ_JOB_EXEC_ERROR
				return this.clean('Job execution of ' + data.generalDetails.url + ' ended with error');
			case 9: // ZM_TYPE_JQ_JOB_LOGICAL_FAILURE
				return this.clean('Job execution of ' + data.generalDetails.url + ' ended with logical error');
			case 10: // ZM_TYPE_JQ_JOB_EXEC_DELAY
				return this.clean('Job execution of ' + data.generalDetails.url + ' is delayed');
			case 12: // ZM_TYPE_TRACER_FILE_WRITE_FAIL
				return this.clean('Failed to write codetrace');// would have been nice to show related data (filename and error), but we don't have this data here 
			default:
				return this.clean("Unknown event type '" + eventType + "'");
		}
	}
});