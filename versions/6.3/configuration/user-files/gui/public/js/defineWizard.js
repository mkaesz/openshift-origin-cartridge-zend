document.addEvent('showIntegratedToast', function() {
	document.fireEvent('toastNotification', {'message': 'The application was successfully defined'});
});

var defineWizard = new Class({
	Implements: [Options],
	
	requestCount: 0,
	totalRequest: 0,
	logo: '',
	submitState: '',
	
	getOptions: function() {
		return {
			url: '',
			defaultServer: ''
		};
	},
	
	initialize: function(options) {
		this.setOptions(this.getOptions(), options);
	},
	
	 wizardComplete: function() {
		var params = $('defineApplicationForm').toObj();
		params.baseUrl = $('baseUrl').get('value');
		params.baseUrl = params.baseUrl.replace('[default-server]', '<default-server>');
		
		var request = new Request.WebAPI({url: this.options.url, data:params, method: 'post',
			async: false,
			onSuccess: function(response) {
				document.fireEvent('showIntegratedToast');
				var okMsgPane = $$('#settingsSet .message-box').removeClass('hidden');
				var errorMsgPane = $$('#settingsSet .message-box.error').addClass('hidden');
				
				// remove the application from list so it wont be displayed again
				defineData.each(function(application, key) {
					if(application.base_url == params.baseUrl) {
						delete defineData[key];
			        }
				});
				
				this.fireCompleteEvent();
			}.bind(this),
			onFailure: function(response) {
				var respObj = JSON.decode(response.response);
				var errorMessage = 'Could not define application';
				if (respObj.errorData != undefined) {
					errorMessage = respObj.errorData.errorMessage;
				}
				
				var okMsgPane = $$('#settingsSet .message-box').addClass('hidden');
				var errorMsgPane = $$('#settingsSet .message-box.error')[0];
				 errorMsgPane.removeClass('hidden');
				 errorMsgPane.set('text', errorMessage);
		}});

		request.post();
	 },
	 
	 fireCompleteEvent: function() {
		 document.fireEvent('wizardComplete', {applicationId: this.options.applicationId, type: this.options.type});
	 },
	
	 uploadStarted: function() {
		 this.submitState = $$('.define-save').hasClass('disabled'); 
		 $$('.define-save').addClass('disabled');
	},
	
	setLogo: function(path) {
		this.logo = path;
	},
	
	uploadComplete: function(status, response) {
		$('defineApplicationForm').getElement('#logo').set('value', this.logo);
		
		var okMsgPane = $$('#settingsSet .message-box').addClass('hidden');
		 
		if (status) { // upload complete successfuly
			$$('.define-save').removeClass('disabled');
			var okMsgPane = $$('#settingsSet .message-box.ok')[0];
			okMsgPane.set('text', response);
			okMsgPane.removeClass('hidden');
		} else { // upload failed
			$$('.define-save').addClass('disabled');
			var errorMsgPane = $$('#settingsSet .message-box.error')[0];
			errorMsgPane.removeClass('hidden');
			errorMsgPane.set('text', response);
		}
	 }
});