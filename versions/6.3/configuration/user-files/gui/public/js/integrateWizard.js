document.addEvent('showIntegratedToast', function() {
	document.fireEvent('toastNotification', {'message': 'Integration was completed'});
});

var integrateWizard = new Class({
	Implements: [Options],
	
	requestCount: 0,
	totalRequest: 0,
	logo: '',
	submitState: '',
	
	getOptions: function() {
		return {
			url: ""
		};
	},
	
	initialize: function(options) {
		this.setOptions(this.getOptions(), options);
	},
	
	 wizardComplete: function() {
		
		var params = $('IntegrateApplicationForm').toObj();

		var request = new Request.WebAPI({url: this.options.url, data:params, method: 'post',
	
			onSuccess: function(response) {
				closeDialog();
				document.fireEvent('showIntegratedToast');
			},
			onFailure: function() {
				var okMsgPane = $$('#settingsSet .message-box').addClass('hidden');
				var errorMsgPane = $$('#settingsSet .message-box.error')[0];
				 errorMsgPane.removeClass('hidden');
				 errorMsgPane.set('text', 'Could not integrate application');
		}});

		request.addEvent("complete", this.fireCompleteEvent.bind(this));
		request.post();
	 },
	 
	 fireCompleteEvent: function() {
		 document.fireEvent('wizardComplete', {applicationId: this.options.applicationId, type: this.options.type});
	 },
	
	 uploadStarted: function() {
		 this.submitState = $('wizard-control-submit').get('disabled');
		 $('wizard-control-submit').set('disabled', true);
	},
	
	setLogo: function(path) {
		this.logo = path;
	},
	
	uploadComplete: function(status, response) {
		$('IntegrateApplicationForm').getElement('#logo').set('value', this.logo);
		//$('wizard-control-submit').set('disabled', false);
		$('wizard-control-submit').set('disabled', this.submitState);
		var okMsgPane = $$('#settingsSet .message-box').addClass('hidden');
		 
		if (status) { // upload complete successfuly
			var okMsgPane = $$('#settingsSet .message-box.ok')[0];
			okMsgPane.set('text', response);
			okMsgPane.removeClass('hidden');
		} else { // upload failed
			var errorMsgPane = $$('#settingsSet .message-box.error')[0];
			errorMsgPane.removeClass('hidden');
			errorMsgPane.set('text', response);
		}
	 }
});