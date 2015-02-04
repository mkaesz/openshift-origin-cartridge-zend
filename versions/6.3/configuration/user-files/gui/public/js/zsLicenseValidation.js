var LicenseValidator = new Class({
	'Implements': [Events,Options],
	'options': {
		'baseUrl': ''
	},
	'webApiRequest': null,
	'userField': null,
	'serialField': null,
	'validationClock': 0,
	'initialize': function(options, user, serial) {
		this.setOptions(options);

		if ($(user)) {
			this.userField = $(user);
		}
		
		if ($(serial)) {
			this.serialField = $(serial);
		}
		
		this.webApiRequest = new Request.WebAPI({
			url: '{baseUrl}/Api/serverValidateLicense'.substitute({'baseUrl': this.options.baseUrl}),
			onSuccess: this._success.bind(this),
			onFailure: this._fail.bind(this),
			onComplete: this._complete.bind(this),
		});
		
		formElements = new Elements([this.userField, this.serialField]);
		formElements.addEvent('input', function(event) {
			this.serialField.value = this.serialField.value.trim();
			if ((this.serialField.value.length == 32) && (this.userField.value.length > 1)) {
				if (this.validationClock) {
					clearTimeout(this.validationClock);
				}
				this.validationClock = this.validate.delay(750, this);
			}
		}.bind(this));
		
	},
	'setOptions': function(options) {
		this.options.baseUrl = options.baseUrl;
	},
	'validate': function() {
		if (this.serialField.value.length == 32 && this.userField.value.length > 0) {
			this.fireEvent('preValidate',{'inputs': new Elements([this.userField, this.serialField])});
			this.webApiRequest.post({licenseName: this.userField.value, licenseValue: this.serialField.value});
		} else if(this.serialField.value > 0 && this.userField.value.length > 0) {
			this.fireEvent('invalid', {'user': this.userField, 'serial': this.serialField, 'errorData': {errorMessage: ''}});
		}
	},
	'_success': function(response) {
		if (response.responseData.licenseValidated) {
			this.fireEvent('valid', {'user': this.userField, 'serial': this.serialField, 'licenseChange': response.responseData.licenseChange});
		} else {
			this.fireEvent('invalid', {'user': this.userField, 'serial': this.serialField, 'licenseChange': response.responseData.licenseChange});
		}
	},
	'_fail': function(response) {
		response = JSON.decode(response.responseText);
		this.fireEvent('invalid', {'user': this.userField, 'serial': this.serialField, 'errorData': response.errorData});
	},
	'_complete': function(response) {
		this.fireEvent('postValidate',{'response': response, 'inputs': new Elements([this.userField, this.serialField])});
	}
});