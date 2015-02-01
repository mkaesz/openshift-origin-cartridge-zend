var zPickerDate = new Class({
	Extends: Picker.Date,
	
	getInputDate: function(input) {
		Date.defineParsers(this.options.format);
		this.parent(input);
	}
});