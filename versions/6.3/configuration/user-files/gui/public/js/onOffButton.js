var onOffButton = new Class({
	positive: ['1', '1', 'On', 'on', 'Yes', 'yes'],
	negative: ['0', '', 'Off', 'off', 'No', 'no'],
	
	render: function() {
		$$('.boolean').each(function(item) {
			if (item.get('parent') == undefined) { // no facade yet
				var booleanElement = new Element('div', {
					'id': 'boolean-field-' + this.clean(item.name),
					'class': 'directive_field_boolean_facade',
				})
				booleanElement.addEvent('click', function(e) { this.toggleBtn(e.target) }.bind(this));
				this.changeButtonStatus(booleanElement);
				booleanElement.inject(item, 'before');
				
				item.set('parent', booleanElement.get('id'));
				item.set('type', 'hidden');
			}
		}.bind(this));
	},
	
	toggleBtn: function(element) {
		var cleanId = element.get('id').replace('boolean-field-', '');
		var inputElement = $('directive-field-' + cleanId); 
		
		// dont change button if the input is disabled
		if (inputElement.get('disabled')) {
			return;
		}
		
		var revertedValue = this.getRevertedStatus(inputElement.get('value'));
		inputElement.set('value', revertedValue);
		
		this.changeButtonStatus(element);
	},
	
	changeButtonStatus: function(button) {
		var cleanId = button.get('id').replace('boolean-field-', '');
		var value = $('directive-field-' + cleanId).get('value');
		
		if (this.getStatus(value)) {
			var divClass = 'on-button';
		} else {
			var divClass = 'off-button';
		}
		
		button.removeClass('on-button').removeClass('off-button');
		button.addClass(divClass);
	},
	
	getStatus: function(value) {		
		if (this.positive.contains(value)) {
			return true;
		}
		
		return false;
	},
	
	getRevertedStatus: function(value) {
		if (this.positive.contains(value)) {
			return this.negative[this.positive.indexOf(value)];
		}
		
		return this.positive[this.negative.indexOf(value)];
	},
	
	clean: function(value) {
		var cleaner = new Element('div');
		cleaner.set('text', value);
		
		return cleaner.get('html');
	}
});