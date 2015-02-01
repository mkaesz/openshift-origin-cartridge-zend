var IpWidget = new Class({
	'Implements': [Options, Events],
	'options': {},
	'events':{},
	'ipFields':{},
	'widgetInput': null,
	'value': null,
	'initialize': function(widgetInput) {
		if (typeof widgetInput == 'object') {
			this.widgetInput = widgetInput;
		} else {
			this.widgetInput = $(widgetInput);
		}
		
		var wrapper = new Element('span', {'class': 'ipwidget ipwidget_fieldset'});
		this.ipFields = [
			                 new Element('input', {'class': 'ipwidget_field', 'maxlength': 3}),
			                 new Element('input', {'class': 'ipwidget_field', 'maxlength': 3}),
			                 new Element('input', {'class': 'ipwidget_field', 'maxlength': 3}),
			                 new Element('input', {'class': 'ipwidget_field', 'maxlength': 3}),
		                 ];
		this.ipFields.each(function(item, key) {
			if (key > 0) {
				wrapper.appendText('.');
			}
			wrapper.adopt(item);
		});
		
		this.widgetInput.set('type', 'hidden');
		this.widgetInput.getParent().adopt(wrapper);
		this.value = this.widgetInput.value;
		
		var address = this.widgetInput.value;
		var ipAddress = '';
		if (address.test(/^\d+\.\d+\.\d+\.\d+$/)) {
			ipAddress = address;
		}
		
		if (ipAddress != '') {
			var ipParts = ipAddress.split('.');
			this.ipFields.each(function(item,key){
				item.value = ipParts[key];
			});
		}
		
		this.widgetInput.getParent().addEvent('input:relay(span.ipwidget input.ipwidget_field)', function(event){
			var address = this.ipFields.map(function(item){return item.value}).join('.');
			if (address.test(/^\d+\.\d+\.\d+\.\d+$/)) {
				this.widgetInput.value = address;
				this.value = address;
				this.fireEvent('ipValid',{ip: address});
			} else {
				if (this.value != '') {
					this.value = '';
					this.widgetInput.value = '';
				}
				this.fireEvent('ipInvalid',{});
			}
		}.bind(this));
		
		this.widgetInput.store('ipwidget', this);
	}
});