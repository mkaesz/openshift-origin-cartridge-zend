
var ZendLicenseRetriever = new Class({
	'Implements': [Events, Options],
	'options': {},
	'checkLicenseTimer': 0,
	'modalBox': null,
	'haveInternet': false,
	'tip': null,
	'extraParams': '',
	'zsVersion': '',
	'protocol': 'http:',
	'initialize': function(zsVersion, extraParams){
		if (extraParams != '' && extraParams[0] != '&') {
			extraParams = '&' + extraParams;
		}
		this.extraParams = extraParams;
		
		if (zsVersion != undefined) {
			this.zsVersion = zsVersion;
		}
		
		if (document.location.protocol != "http:") {
			this.protocol = 'https:';
		}
		
		window.addEvent('load', function(){
			this.createNoInternetTooltip();
			
			var elem = new Element('script', {type: 'text/javascript', src: this.protocol + '//www.zend.com/products/server/license/ping601'});
			elem.inject($(document.body));
		}.bind(this));
		
		this.modalBox = new SimpleModal({width: 673, closeButton: false,
			hideHeader: false, hideFooter: false, draggable: false, overlayClick: false,
			template: "<div id=\"simple-modal-box\"><div class=\"simple-modal-header wizard-title\">{_TITLE_}</div>{_CONTENTS_}</div>"});
	},
	
	ping: function() {
		this.haveInternet = true;
		this.tip.detach();
	},
	
	'createNoInternetTooltip': function() {		
    	this.tip = new FloatingTips('.purchase-btn', {
    		// Content can also be a function of the target element!
			content: function(e) {
				return 'It seems that there is a problem with your Internet connection'; 
			},
			showDelay: 0,
    		hideDelay: 100,
			html: false,
			position: 'bottom', // Bottom positioned
			center: true, // Place the tip aligned with target
			arrowSize: 8, // A bigger arrow!
    		distance: 0,
			showOn: 'click'
    	});
    },
	
	/**
	 * Open an iframe into zend.com
	 * @param string edition
	 */
	'openZendPortal': function(edition, daysToExpired) {
		// user don't have internet connection
		if (! this.haveInternet) {
			return;
		}

		location.hash = '';
		
		this.modalBox.show({
		      "model":	"modal",
		      "title": _t("Change Zend Server License") + '<div style="float: right; display:inline-block; cursor: pointer; margin-right: 5px;" onclick="zendIntegration.modalBox.hide()">x</div>',
		      "contents": '<iframe id="licenseFrame" src="" style="width: 980px; height: 700px;"></iframe>'
		});

		this._sendUiMessage(edition.toUpperCase(), daysToExpired);
		this.checkLicenseTimer = this._checkLicense.periodical(200, this);
	},
	
	/**
	 * Open an iframe into zend.com
	 * @param string edition
	 */
	'openZendPortalWithCapabilities': function(currentEdition, targetEdition, capabilitiesList) {
		if (currentEdition == targetEdition) {
			this.openZendPortal(targetEdition);
			return ;
		}
		
		// user don't have internet connection
		if (! this.haveInternet) {
			return;
		}
		
		location.hash = '';
		
		this.modalBox.show({
			"model":	"modal",
			"title": _t("Change Zend Server License") + '<div style="float: right; display:inline-block; cursor: pointer; margin-right: 5px;" onclick="zendIntegration.modalBox.hide()">x</div>',
			"contents": "<div class=\"simple-modal-body\">" +
				capabilitiesList.outerHTML + 
  				'</div><div class=\"simple-modal-footer\">\
  				<button id="licenseFrameCancel_btn">Cancel</button>\
  				<button id="licenseFrame_btn">Continue</button>\
  				</div>'+
  				'<iframe id="licenseFrame" src="" style="width: 700px; height: 400px;" class="hidden"></iframe>'
		});

		$('licenseFrameCancel_btn').addEvent('click', function() {
			this.hide();
		}.bind(this));
		
		$('licenseFrame_btn').addEvent('click', function() {
			this._adaptDialogForZendcom();
			this._sendUiMessage(targetEdition.toUpperCase());
			this.checkLicenseTimer = this._checkLicense.periodical(200, this);
		}.bind(this));
	},
	
	'hide': function() {
		this.modalBox.hide();
	},
	
	/**
	 * @private
	 */
	'_checkLicense': function(){
		if(location.hash != ''){
			var hash = window.location.hash.replace(/#/g, '');
			var parsedFragments = hash.parseQueryString();
			
			// get serial number
			if (parsedFragments.serial != undefined) {
				this.fireEvent('licenseReceived', {'user': parsedFragments.orderNumber, 'serial': parsedFragments.serial});
				clearInterval(this.checkLicenseTimer);
				location.hash = '';	
			} else if (parsedFragments.height != undefined) {
				$('licenseFrame').setStyle('height', Math.max(200, parsedFragments.height.toInt()));
				$('licenseFrame').setStyle('width', Math.max(200, parsedFragments.width.toInt()));
				window.fireEvent('resize'); 
				location.hash = '';
			}
		}
	},
	/**
	 * @param string edition
	 * @private
	 */
	'_sendUiMessage': function(edition, daysToExpired) {
		var iwin;
		if(navigator.userAgent.indexOf("Safari") != -1){
	    	iwin = frames["licenseFrame"];
		} else {
	    	iwin = document.id("licenseFrame").contentWindow;
		}
		
		if (daysToExpired != undefined && daysToExpired > 0) {			 
			iwin.location = this.protocol + '//www.zend.com/products/server/license/product?retUrl=' + encodeURIComponent(location.href) + '&edition=' + edition + '&version=' + this.zsVersion + '&daysLeft=' + daysToExpired + this.extraParams;
		} else {			
			iwin.location = this.protocol + '//www.zend.com/products/server/license/product?retUrl=' + encodeURIComponent(location.href) + '&edition=' + edition + '&version=' + this.zsVersion + this.extraParams;
		}
	},
	/**
	 * @private
	 */
	'_adaptDialogForZendcom': function() {
		$('licenseFrame').removeClass('hidden');
		$$('.simple-modal-body').hide(); /// hide capbilities' list
		$$('.simple-modal-footer').hide(); /// hide buttons
		window.fireEvent('resize',{}); /// cause the dialog box to recenter after a resize
	}
});