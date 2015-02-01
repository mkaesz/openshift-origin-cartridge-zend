var zgridDirectives = new Class({
	Implements: [Events,Options],
	
	daemonDirectives: [],
	extDirectives: [],
	onOff: null,
	deploymentValidate: true,
	
	getOptions: function(){
		return {
			validateUrl: "<?php echo $this->basePath()?>/Api/configurationValidateDirectives",
			url: null,
			delay: 700,
			isAllowedToSaveDirectives: true,
		};
	},
	
	initialize: function(options){
		this.setOptions(this.getOptions(), options);
		this.onOff = new onOffButton();
	},

	onLoadData: function (gridRowDetails, data)
	{
		if (data) {
			var extension = gridRowDetails.id;
			
			var extensionDetails = '';
			var gridDataRow = gridRowDetails.data;
			
			extension = gridRowDetails.id;
			var rowContent = this.getRow(data.responseData, extension, gridDataRow);
			$(gridRowDetails.rowId).set('html', rowContent);

			/// add previous value tooltip
			data.responseData.directives.each(function(directive){
				
				if (directive.fileValue) {
					value = directive.fileValue;
				} else {
					value = directive.defaultValue;
				}
				
				var display = $('directive-field-'+this.clean(directive.name));
				display.set('value', value);
				
				if (directive.previousValue != null) {
					display.set('originalValue',directive.previousValue);
					display.set('directiveType', directive.type);
					display.addClass('highlight-valid');
					display.addEvent('mouseover', function(event){
						var originalValue = event.target.get('originalValue');
						
						if (event.target.get('directiveType') == 'boolean') {
							if (onOffButton.prototype.getStatus(event.target.get('originalValue'))) {
								originalValue = _t('On');
							} else {
								originalValue = _t('Off');
							}
						}
						
						var valueText = originalValue ?
									'"{originalValue}"'.substitute({'originalValue': this.clean(originalValue)}) :
									_t('<em>empty value</em>');
						ToolTip.instance(event.target, _t('Previous Value: {valueText}', {'valueText': valueText}), {hideDelay: 240}).show();
					}.bind(this));
				} else {
					if (directive.type == 'boolean') {
						display.set('originalValue',directive.defaultValue);
					} else {
						display.set('originalValue',directive.fileValue);
					}
					display.set('directiveType',directive.type);
				}
			}.bind(this));
			
			var expandedContainer = $('tableDescContent_' + extension);
			var tabPane = new TabPane('tableDescContent_' + extension, {}, function() {
                // @todo - ZSRV-5738 - when 'Messages' tab is opened by default, it's width does not take into consideration the directives list width
				//return (typeof this.messageList == 'undefined' || this.messageList.length == 0) ? 0 : 1;
                return 0;
			}.bind(gridDataRow));

			this.onOff.render();
			
			var myVerticalSlide = new Fx.Slide('tableDescContent_' + extension, {resetHeight: true});
			myVerticalSlide.hide();
			myVerticalSlide.slideIn();
			if (this.options.isAllowedToSaveDirectives) {
				// click handling for all boolean widgets
				expandedContainer.getElements('div.directive_field_boolean_facade').addEvent('click', this.switchStatusBoolean);
				// apply degrading onchange hook to perform validation for any field type
				// different inputs need different event types (keyup, change...)
				expandedContainer.getElements('input:not([type=\'text\'])').addEvent('change', this.scheduleValidate.bind(this));
				expandedContainer.getElements('select').addEvent('change', this.scheduleValidate.bind(this));
				expandedContainer.getElements('input[type=\'text\']').addEvent('keyup', this.scheduleValidate.bind(this));
			} else {
				expandedContainer.getElements('div.directive_field_boolean_facade').removeProperty('onClick');
				expandedContainer.getElements('input:not([type=\'text\'])').set('disabled', true);
				expandedContainer.getElements('input[type=\'text\']').set('disabled', true);
				expandedContainer.getElements('select').set('disabled', true);
			}
		}
		
		this.fireEvent('descriptionOpened', {row: gridRowDetails, data: data});
	},
	
	switchStatusBoolean: function(event) {
		var cleanId = event.target.get('id').replace('boolean-field-', '');
		var hidden = $('directive-field-' + cleanId);
		
		hidden.fireEvent('change', {target: hidden, styleChangeTarget: event.target, name: hidden.name, delay: 0});
		
    	//// Confirm changes before exit
    	document.fireEvent('directives-changed');
	},
	
	scheduleValidate: function(event) {
		var target = event.target;
		if (typeof target.timer != 'undefined' && target.timer != null) {
			clearTimeout(target.timer);
		}
		
		var name = target.name;
		if (event.styleChangeTarget) {
			name  = event.name;
		}
		
		var startValidationElement = target;
		if (typeof event.styleChangeTarget != 'undefined') {
			startValidationElement = event.styleChangeTarget;
		}
		
		var delay = isNaN(event.delay) ? this.getOptions().delay : event.delay;
		
		target.timer = this.validate.bind(this, target, startValidationElement, name).delay(delay);
		
		//// Confirm changes before exit
		document.fireEvent('directives-changed');
	
		startValidationElement.addEvent('mouseover', function(event){
			var cleanId = event.target.get('id').replace('boolean-field-', '').replace('directive-field-', '');
			var hiddenElement = $('directive-field-' + cleanId);
			
			var originalValue = hiddenElement.get('originalValue');
			var currentValue = hiddenElement.get('value');
			
			if (currentValue != originalValue) {
				if (hiddenElement.get('directiveType') == 'boolean') {
					if (onOffButton.prototype.getStatus(originalValue)) {
						originalValue = _t('On');
					} else {
						originalValue = _t('Off');
					}
				}
				
				ToolTip.instance(event.target, _t('Previous Value:') + ' "' + this.clean(originalValue) + '"', {hideDelay: 240}).show();
			}
		}.bind(this));
	},
	
	validate: function (target, styleChangeTarget, name) {
		if (!this.options.validateUrl) {
			return;
		}
		

		if (typeof styleChangeTarget.spinner == 'undefined') {
			styleChangeTarget.spinner = new Spinner(styleChangeTarget);
		}
		styleChangeTarget.spinner.show();
		
		/// duplicate class handling for boolean widgets
		styleChangeTarget.removeClass('invalid');
		styleChangeTarget.removeClass('valid');
		target.removeClass('invalid');
		target.removeClass('valid');
		styleChangeTarget.addClass('validating');
		target.addClass('validating');
		
		if (typeof styleChangeTarget.spinner == 'undefined') {
			styleChangeTarget.spinner = new Spinner(styleChangeTarget);
		}
		styleChangeTarget.spinner.show();
		
		var directives = {};
		directives[target.name] = target.value;
		
		var params = {
			"directives": directives
		};

		var request = new Request.WebAPI({url: this.options.validateUrl, data:params});

		request.addEvent("complete", this.onValidate.bind(this, target, styleChangeTarget, name) ) ;
		request.get();
	},
	
	onValidate: function(target, visualTarget, name, data) {
		target.removeClass('validating');
		visualTarget.removeClass('validating');
		visualTarget.spinner.hide();
		if (data) {
			var validate = data.responseData.validates.pick();
			if (validate.valid) {
				target.addClass('valid');
				visualTarget.addClass('valid');
				// enable the Save button
				$('save_directives').fireEvent('checkSaveButton', {'isValid': true});
				if (! data.responseData.prerequsitesValidation) {
					this.deploymentValidate = false;
					document.fireEvent('toastAlert', {'message': 'Directive ' + name + ' is required by deployed application'});
				} else {
					this.deploymentValidate = true;
				}
			} else {
				target.addClass('invalid');
				visualTarget.addClass('invalid');
				document.fireEvent('toastAlert', {'message': 'Directive ' + name + ' failed validation'});
				document.fireEvent('directiveValidationFailed', {'validateTarget': target});
				// dissable the Save button
				$('save_directives').fireEvent('checkSaveButton', {'isValid': false});
			}
		} else {
			target.addClass('invalid');
			visualTarget.addClass('invalid');
			document.fireEvent('toastAlert', {'message': 'Validation request failed for directive ' + name});
			document.fireEvent('directiveValidationFailed', {'validateTarget': target});
			// dissable the Save button
			$('save_directives').fireEvent('checkSaveButton', {'isValid': false});
		}
	},
	
	loadData: function(data)
	{
		// if data already loaded - just show them
		if ($('tableDescContent_' + data.id).get('html') != '') {
			var myVerticalSlide = new Fx.Slide('tableDescContent_' + data.id, {resetHeight: true});
			myVerticalSlide.hide();
			myVerticalSlide.slideIn();
			return;
		}
		
		if (!this.options.url)
			return;

		var params = {
			extension: data.data.name
		};
		
		if (data.data.daemonStatus && 'None' != data.data.daemonStatus) {
			params.daemon = data.data.daemonName;
		}
		
		var request = new Request.WebAPI({url: this.options.url, data:params});

		request.addEvent("complete", this.onLoadData.bind(this, data) ) ;

		request.get();
	}, 
	
	populateDirective: function(directive) {
		
		var directiveElement = '';
		
		if (directive.type == 'boolean') {
			directiveElement = this.getInputElementString(directive, true);
		} else if(directive.type == 'select') {
			directiveElement = this.getInputElementSelect(directive);
		} else {
			directiveElement = this.getInputElementString(directive);
		}
	
		return '<tr>' + '<td><h1>' + this.clean(directive.name) + '</h1><label>' + this.clean(directive.description) + '</label></td>' + 
						'<td>' + directiveElement + '</td>' + 
				'</tr>';
	},
	
	getInputElementString: function(directive, boolean) {
		
		var template;
		var units = this.clean(directive.units);
		
		//disabled = (directive.isDisabled) ? 'disabled="disabled" ' : '';
		//var length = directive.maxLength;
		if (directive.fileValue) {
			value = this.clean(directive.fileValue);
		} else {
			value = this.clean(directive.defaultValue);
		}
		
		// output sanitation for ZSRV-7503
		value = value.replace(/^"(.+)"$/g, "$1");
		
		var booleanClass = '';
		if (boolean) {
			booleanClass = 'boolean';
		}
		
		template = '<input class="' + booleanClass + '" id="directive-field-' + this.clean(directive.name) + '" type="text" name="' + this.clean(directive.name) + '" value="' + value + '" size="20" />';
		if (units) {
			template += '&nbsp;' + units; 
		}
		return template;
	},
	
	getInputElementSelect: function(directive) {		
		var element = '<select id="directive-field-' + this.clean(directive.name) + '" name="' + this.clean(directive.name) + '">';
		var value;
		if (directive.fileValue) {
			value = this.clean(directive.fileValue);
		} else {
			value = this.clean(directive.defaultValue);
		}
		
		Object.each(directive.listValues, function(optionValue) {
			selected = '';
			actualValue = Object.keyOf(directive.listValues, optionValue); // we're interested in the key, rather than the display value
			if (actualValue == value) {
				selected = 'selected="selected"';
			}			
			
			element += '<option value="' + this.clean(actualValue) + '" ' + selected + ' >' + 
						this.clean(optionValue) + 
					  '</option>';
		}.bind(this));
		
		element += '</select>';
		
		return element;
	},
	
	createDirectivesTable: function(directives) {
		var i=0;
		var template='';

		var leftDirTable = '';
		var rightDirTable = '';
		
		if (! directives.length) {
			template += '<tr><td><table class="emptyContent"><tr><td>' +  _t('There are no directives for this extension') + '</td></tr></table></td></tr>';
		} else {
			directives.each(function(dir) {
				if (i%2 == 0) {				
					leftDirTable += this.populateDirective(dir);
				} else {
					rightDirTable += this.populateDirective(dir);
				}
				i++;
			}.bind(this));
			
			template += '<tr><td class="directivesTableColumns"><table class="directivesTableContent">' + leftDirTable + '</table></td><td class="directivesTableColumns"><table class="directivesTableContent">' + rightDirTable + '</table></td></tr>';
		}
		
		template += '</table></div>';
		return template;
	},
	
	getRow: function(data, extension, gridRowDetails) {
	
		var errorTabTitle = '';
        var errorTabContent = '';
        
        var displayMessages = (0 < gridRowDetails.messageList.length);
        var displayDaemonDirectives = (gridRowDetails.daemonStatus && 'None' != gridRowDetails.daemonStatus);
        var messages = '';
                
        if(displayMessages){
        	messages = this.showMessages(gridRowDetails.messageList);
        }
        
		var template = '<div class="extensionsTable" id="tableDescContent_' + extension + '"> \
					<ul class="tabs"> \
						<li class="tab first">' + _t('Directives') + '</li>';
		
		if (displayDaemonDirectives) {
			template +=	'<li class="tab">' + _t('Daemon Directives') + '</li>';
		}
		
		if (displayMessages) {
			template +=	'<li class="tab">' + _t('Messages') + '</li>';
		}
		
		template +=	'</ul> \
					<div class="content"> \
					<table>';
		
		template += '<tr><td><table class="extDescription"><tr><td>' +  this.clean(_t(gridRowDetails.longDescription)) + '</td></tr></table></td></tr>';
		
		this.separateDirectives(data);
		
		template += this.createDirectivesTable(this.extDirectives);

		if (displayDaemonDirectives) {
			template +=	this.displayDaemonDirectives(gridRowDetails.daemonName, this.clean(_t(gridRowDetails.daemonLongDescription)));
		}
		
		if (messages) {
			template += '<div class="content"><div style="padding-left: 15px;">'+ messages +'</div></div>';
		}
		
		template += '<div class="clear"></div></div>';
		
		return template;
	},
	
	showMessages: function(messageList) {
		var messages = '';
		  for (var i = 0; i < messageList.length; i++) {
          	var nodeText = '';
          	if (messageList[i].nodeName) {
          		nodeText = ' in node ' + messageList[i].nodeName;
          	}
          	messages += '<b>' + messageList[i].type + ' message' + nodeText + ': </b>&nbsp;<span>' + this.messageFormat(messageList[i].message) + '</span></br>';
          }
		  return messages;
	},
	
	displayDaemonDirectives: function(daemonName, daemonLongDescription) {
		var daemonName = daemonName.replace(/--/g, ' ');
		var template = '';
		template +=	'<div class="content" id="daemonDirectives_' + daemonName + '"> ';
		template +=	'<table>';
		// for now, no seprate desc for daemon.. template += '<tr><td><table class="extDescription"><tr><td>' +  this.clean(_t(daemonLongDescription)) + '</td></tr></table></td></tr>';
		template +=	this.createDirectivesTable(this.daemonDirectives);
		return template;
	},
	
	separateDirectives: function(data) {
	
		this.extDirectives = [];
		this.daemonDirectives = [];
		data.directives.each(function(dir) {
			if (dir.context == 'Extension') {
				this.extDirectives.push(dir);				
			}
			
			if (dir.context == 'Daemon') {
				this.daemonDirectives.push(dir);				
			}
		}.bind(this));
	},
	
	clean: function(value) {
		var cleaner = new Element('div');
		cleaner.set('text', value);
		
		return cleaner.get('html');
	},
	
	messageFormat: function(string) {
	    return (string + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
	}
	
});