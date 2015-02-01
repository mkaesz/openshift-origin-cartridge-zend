var zgridAuditInfo = new Class({
	Implements: [Events,Options],
	
	parseProgress: function(progress){
		var dictionary = {
				"AUDIT_PROGRESS_REQUESTED": _t('Requested'),
				"AUDIT_PROGRESS_STARTED": _t('Started'),
				"AUDIT_PROGRESS_ENDED_SUCCESFULLY": _t('Success'),
				"AUDIT_PROGRESS_ENDED_FAILED": _t('Failed'),
		};
		return dictionary[progress];
	},
	
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
		// if data already loaded - just show them
		if ($('tableDescContent_' + data.id).get('html') != '') {
			var myVerticalSlide = new Fx.Slide('tableDescContent_' + data.id);
			myVerticalSlide.hide();
			myVerticalSlide.slideIn();
			return;
		}
		
		if (!this.options.url)
			return;
		
		var params = {
			auditId: data.id,
		};
		
		var request = new Request.WebAPI({url: this.options.url, data:params});

		request.addEvent("complete", this.onLoadData.bind(this, data));

		request.get();
	}, 
	
	getRow: function(data) {
		var auditMessage = data.auditMessageDetails.auditMessage;
		var auditProgressList = data.auditMessageDetails.auditProgressList;
		
        var html = '<div id="tableDescContent_' + auditMessage.id + '" class="auditDetails">';
        var parsedExtraData = this.parseExtraData('', auditMessage);
        if (auditMessage.extraData
        		&& ((((typeof auditMessage.extraData) == 'object') && (Object.getLength(auditMessage.extraData) > 0)))
        				|| auditMessage.extraData.length > 0) {
			html += '<div class="content">' + _t('Extra Details:<br />') + parsedExtraData + '</div>';
        } else {
        	html += '<div class="content">' + _t('No extra details to display') + parsedExtraData + '</div>';
        }
        
        if (0 < auditProgressList.length) {
        	html += '<div class="content">';
        	html +=	'<table class="tableWithDescServers">';
        	html +=  '<thead><tr> \
        		<th>!</th> \
        		<th>' + _t('Server Name') + '</th> \
        		<th>' + _t('Progress') + '</th> \
        		<th>' + _t('Time Stamp') + '</th> \
        		<th>' + _t('Extra Information') + '</th> \
        		</tr></thead>';
        	
        	html += auditProgressList.map(function (progress) {
        		return '<tbody><tr><td></td>\
        		<td>'+ progress.serverName +'</td>\
        		<td>'+ this.parseProgress(progress.progress) +'</td>\
        		<td>'+ zGrid2.prototype.timestamp(progress.creationTimeTimestamp) +'</td>\
        		<td class="progressExtraData">'+ this.parseExtraData('', progress) +'</td></tr></tbody>';
        	}.bind(this)).join('');
        	
        	
        	html += '</table></div>';
        	html += '</div>';
        }
        return html;
	},
	
	_parseExtraData: function(column, data, wrapper, joinglue, separateLabels) {
		var output = [];
		Object.each(data.extraData, function (parametersGroup, key, array) {
			var paramsOutput = [];
			parametersGroup.each(function(item, key, array){
				var prefix = '';
				if (isNaN(item.name)) { // adding the key to the string only if it's non numeric (NAN) key 
					prefix += item.name.htmlEntities() + ': ';
					// separate labels from content if content is multi-line
					if (separateLabels && isString(item.value) && item.value.contains("\n")) {
						prefix += '<br />';
					}
				}
				
				if (isString(item.value)) {
					paramsOutput.push(wrapper[0] + prefix + item.value.htmlEntities() + wrapper[1]);
				} else if (item.value instanceof Array) {
					paramsOutput.push(wrapper[0] + prefix + item.value.join(',').htmlEntities() + wrapper[1]);
				} else if (item.value instanceof Object) {
					paramsOutput.push(wrapper[0] + prefix + Object.toQueryString(item.value).htmlEntities() + wrapper[1]);
				}
			});
			output.push(paramsOutput.join(joinglue));
		});
		return output;
	},
	
	parseFlatExtraData: function (column, data) {
		return this._parseExtraData(column, data, ['', ''], ', ', false).join('<br />');
	},
	
    parseExtraData: function (column, data) {
		return this._parseExtraData(column, data, ['<pre>', '</pre>'], '', true).join('<br />');
	},
	
    parseExtraDataLimited: function (column, data) {  
    	dataSize = Object.keys(data.extraData).length;
    	if (dataSize > 1) {
    		return 'There are ' + dataSize + ' messages';
    	}
    	
    	return zgridAuditInfo.prototype.parseFlatExtraData(column, data);
    },	
	
	clean: function(value) {
		var cleaner = new Element('div');
		cleaner.set('text', value);
		
		return cleaner.get('html');
	}
});