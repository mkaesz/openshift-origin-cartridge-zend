document.addEvent('wizardComplete', function(options) {
	if ($('defineApplicationForm')) {
		document.fireEvent('toastNotification', {'message': 'Defining application...'});		
	} else {
		document.fireEvent('toastNotification', {'message': 'Deploying application...'});
	}
});

var deploymentWizard = new Class({
	Implements: [Options],
	
	requestCount: 0,
	totalRequest: 0,
	getOptions: function() {
		return {
			urls: 			[],
			applicationId: 	0,
            library:        null,
			type:		   	'deploy',
			wizardId:		0,
		};
	},
	
	initialize: function(options) {
		this.setOptions(this.getOptions(), options);
	},
	
	wizardClosed: function() {
		var url = baseUrl() + '/Api/applicationCancelPendingDeployment?wizardId=' + this.getWizardId();
		var request = new Request.WebAPI({
			method: 'post',
			url:url, 
			onComplete: function(response) {
				cancelWizard();
			}
		}).send();
	},
	
	uploadStarted: function() {
		 $('wizard-control-forward').set('disabled', true);
	},
	
	uploadComplete: function(status, response) {
		 if ($('url')) {
			 $('url').set('disabled', false);
		 }
		 var okMsgPane = $$('#uploadPage .message-box').addClass('hidden');
		 
		 if (status) { // upload complete successfuly
			this.setPageUrls();

		 	var okMsgPane = $$('#uploadPage .message-box.ok')[0];
		 	okMsgPane.set('text', response);
		 } else { // upload failed
			 $('wizard-control-forward').set('disabled', true);

			 var errorMsgPane = $$('#uploadPage .message-box.error')[0];
			 errorMsgPane.removeClass('hidden');
			 errorMsgPane.set('text', response);
		 }
	 },
	 setPageUrls: function() {
		 if(this.options.type == 'update') {
			this.getPageContent(1, 'readmeContent', this.options.urls[1]);
		 	this.getPageContent(2, 'licenseAgreementContent', this.options.urls[2]);
		 	this.getPageContent(3, 'prerequisitesContent', this.options.urls[3]);
		 	this.getPageContent(4, 'userParamsContent', this.options.urls[4]);
		} else {
			this.getPageContent(1, 'readmeContent', this.options.urls[1]);
			this.getPageContent(2, 'setInstallationContent', this.options.urls[2]);
			this.getPageContent(3, 'licenseAgreementContent', this.options.urls[3]);
			this.getPageContent(4, 'prerequisitesContent', this.options.urls[4]);
			this.getPageContent(5, 'userParamsContent', this.options.urls[5]);
		}
	 },
	 getPageContent: function(pageId, pageElement, pageUrl) {
		 this.totalRequest++;

		 dataObj = new Object();
		 dataObj.wizardAjax = true;
		 
		 var resp = '';
		 
		 var myRequest = new Request({
			url: pageUrl + '?wizardId=' + this.getWizardId(),
			data: dataObj,
			evalScripts: true,
			onComplete: function(response){
				$(pageElement).set('html', response);
				if (response == '') {
					$('sl' + pageId).addClass('disabled');
				} else {
					$('sl' + pageId).removeClass('disabled');
				}
				this.requestCount++;
				if (this.requestCount == this.totalRequest && pageId != 6) {
					$('wizard-control-forward').set('disabled', false);
					var okMsgPane = $$('#uploadPage .message-box.ok')[0];
				 	okMsgPane.removeClass('hidden');
				}
			}.bind(this)
		}).send();

		return resp;
	 },
	 getWizardId: function() {
		 return this.options.wizardId;
	 },
	 wizardComplete: function() {
	 	closeDialog();
		var myRequest = new Request.JSON({
			url: this.options.urls[0] + '?wizardId=' + this.getWizardId()
		});
		
		myRequest.addEvent("success", function(response){
			this.options.applicationId = response.pick();
			this.fireCompleteEvent();
		}.bind(this));
		
		myRequest.send();
	 },
	 
	 fireCompleteEvent: function() {
		 document.fireEvent('wizardComplete', {applicationId: this.options.applicationId, type: this.options.type});
	 }
});

var libraryDeploymentWizard = new Class({
	Extends: deploymentWizard,
	setPageUrls: function() {
		this.getPageContent(1, 'readmeContent', this.options.urls[1]);
		this.getPageContent(2, 'licenseAgreementContent', this.options.urls[2]);
		this.getPageContent(3, 'prerequisitesContent', this.options.urls[3]);
		this.getPageContent(4, 'userParamsContent', this.options.urls[4]);
		this.getPageContent(5, 'summaryContent', this.options.urls[5]);
	},
	getOptions: function() {
		var options = this.parent();
		options.type = 'library';
		return options;
	},
	wizardClosed: function() {
		var url = baseUrl() + '/LibraryWizard/cancel?wizardId=' + this.getWizardId();
		var request = new Request({
			method: 'post',
			url:url, 
			onComplete: function(response) {
				cancelWizard();
			}
		}).send();
	},
	wizardComplete: function() {
	 	closeDialog();
		var myRequest = new Request.JSON({
			url: this.options.urls[0] + '?wizardId=' + this.getWizardId()
		});
		
		myRequest.addEvent("success", function(library){
			this.options.library = library;
			this.fireCompleteEvent();
		}.bind(this));
		
		myRequest.send();
	 },
	 
	 fireCompleteEvent: function() {
		 document.fireEvent('wizardComplete', {library: this.options.library, type: this.options.type});
	 }
});