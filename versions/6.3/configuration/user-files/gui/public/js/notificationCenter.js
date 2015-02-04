var NotificationCenter = new Class({
	
	Implements: [Events, Options],
	
	content: null,
	button: null,
	restartButton: null,
	iconCount: null,
	messageCount: 0,
	notifications: {},
	hash: 0,
	interval: 1000,
	restartTip: null,
	restartDialog: null,
	allowRestart: false,
	allowDismiss: true,
	delayedTimer: null,
	myKeyboardEvents: null,
	restartNeeded: false,
	daemonMessages: {},
	initialize: function(interval, allowRestart, allowDismiss) {
		this.allowRestart = allowRestart;
		this.allowDismiss = allowDismiss;
		this.button = $('main-menu-notification-btn');
		this.restartButton = $('main-menu-restart-btn');
		this.content = $('notification-messages');
		this.iconCount = $('notification-count');
		this.interval = interval * 1000;

		this.button.addEvent('click', function(){
			if (this.messageCount > 0) {
				if (this.content.hasClass('hidden')) {
					this.open();
				} else {
					this.close();
				}
			}
		}.bind(this));
		
		this.restartButton.addEvent('click', function() {
			if (! this.restartButton.hasClass('restarting')) {
				this._hideRestartTip();
				this._showRestartDialog();
			}
		}.bind(this));

		this.getNotifications();
		
		var htmlContent = '<div onClick="notificationCenter._hideRestartTip()" class="restart-tooltip" style="cursor: pointer;">\
			<div class="clear"><div class="headline float-left"><h3>' + _t('Restart is required') + '</h3></div>\
			{dismissStandIn}</div>\
			<div class="body clear"><span>'+ _t('Zend Server has to be restarted to apply changes made to the configuration or a component.') + '</span></div>\
			</div>';
		if (this.allowDismiss) {
			htmlContent = htmlContent.substitute({dismissStandIn: '<div class="float-right restart-dismiss">x</div>'});
		} else {
			htmlContent = htmlContent.substitute({dismissStandIn: ''});
		}
		this.restartTip = new FloatingTips('main-menu-restart-btn', {
    		content: function(e) { return htmlContent; },
    		html: true,
    		position: 'bottom',
    		center: true,
    		arrowSize: 10,
    		distance: 1,
    		showOn: 'null',
    		hideOn: 'null',
    		className: 'floating-tip'
    	});
		
		document.addEvent('beginRestart', function(event){
			if (event.origin != this) {
				this._startRestartingAnimation();
			}
		}.bind(this));
		
		document.addEvent('refreshNotifications', this.getNotifications.bind(this));
		document.addEvent('disableRestartTooltip', this._disableTooltip.bind(this));
		
		this.myKeyboardEvents = new Keyboard({
		    defaultEventType: 'keyup',
		    events: {
		        'esc': function() {
		        	this.close();
		        }.bind(this)
		    }
		});
	},
	
	_disableTooltip: function() {
		Cookie.write('restart-tip', 'true');
	},
	
	_showRestartDialog: function() {
		this.restartDialog = new SimpleModal({width: 673, closeButton: false,
			hideHeader: false, hideFooter: false, draggable: false, overlayClick: false,
			template: "<div id=\"simple-modal-box\"><div class=\"simple-modal-header wizard-title\">{_TITLE_}</div>\
					   <div class=\"simple-modal-body\">{_CONTENTS_}</div>\
					   <div class=\"simple-modal-footer\"></div></div>"
		});
		
		this.restartDialog.addButton(_t("Cancel"), "btn");
		var RestartBtn = this.restartDialog.addButton(_t("Restart"), "btn primary", function(btn){
			if (this.allowRestart) {
				this._restartServers();
				this.restartDialog.hide();
			}
		}.bind(this));

        RestartBtn.set('disabled', true);

		this.restartDialog.show({
	      "model":	"modal",
	      "title": _t('Restart'), 
	      "contents": '<div id="restart-server-box" class="restart-server-box"></div>'
	    });

        if (! this.allowRestart) {
            var form = _t('This action cannot be performed: Incorrect permissions. <br /><br />\
						   Restarting the Web server can only be performed by the Administrator');

            window.fireEvent('resize', {});
            $('restart-server-box').set('html', form);
        } else {

            var form = '';

            RestartBtn.set('disabled', false);

            if (this.restartNeeded) {
                var form = _t('To apply the changed configurations, a restart must be performed.<br /><br /> \
           Are you sure you wish to proceed? <br /><br />');
            } else {
                var form = _t('You are about to perform a restart.<br /><br /> \
           Are you sure you wish to proceed? <br /><br />');
            }

            var message = '';
            if (Object.some(this.daemonMessages, function(item){
            	return item;
            })) {
                var messages = [];
                
                if (this.daemonMessages.phpRestart) {
                	messages.push('<p>{message}</p>'.substitute({'message': _t('PHP processes will be restarted. While the server is restarting, some clients may be denied service' )})); 
                }
                
                if (this.daemonMessages.jqdRestart) {
                    messages.push('<p>{message}</p>'.substitute({'message': _t('Job Queue daemon will be restarted. Until the daemon is back online, the execution of scheduled jobs may be disrupted')})); 
                }

                if (this.daemonMessages.scdRestart) {
                    messages.push('<p>{message}</p>'.substitute({'message': _t('Session Clustering daemon will be restarted, this will result in a loss of active sessions\' information' )})); 
                }
                message = messages.join("\n");
            } else {
                message = _t('This action may result in a loss of session related information. Job data will be retained.');
            }

            form +=  '<div class="restart-server-note">{message}</div>'.substitute({'message': message});

            $('restart-server-box').set('html', form);
        }
	},
	
	getNotifications: function() {
		var url = baseUrl() + '/Api/getNotifications';
		clearTimeout(this.delayedTimer);
		this.delayedTimer = null;
		//make the request
		var request = new Request.WebAPI({
			method: 'get',
			url: url,
			data: {hash: this.hash},
			'version': '1.6',
			onSuccess: function(response) {
			},
			onFailure: function(response) {
				var decoded = JSON.decode(response.response);
				if (decoded) {
					document.fireEvent('toastAlert', {'message': decoded.errorData.errorMessage});
				}
			}
		});
		
		request.addEvent("complete", this.parseNotifications.bind(this) ) ;
		request.get();
	},
	
	sendDeleteNotification: function(type) {
		var url = baseUrl() + '/Api/deleteNotification';
		//make the request
		var request = new Request.WebAPI({
			method: 'post',
			url: url,
			data: {'type': notificationCenter.notifications[type].name},
			onSuccess: function(response) {
			}
		});
		
		request.post();
	},
	
	sendUpdateNotification: function(type, repeat) {
		var url = baseUrl() + '/Api/updateNotification';
		//make the request
		var request = new Request.WebAPI({
			method: 'post',
			url: url,
			data: {'type': notificationCenter.notifications[type].name, 'repeat': repeat},
			onSuccess: function(response) {
			}
		});
		
		request.post();
	},
	
	parseNotifications: function (response)
	{
		if (response) {
			if (this.hash != response.responseData.hash) {
				var notificationsTypes = [];
				// add new messages
				response.responseData.notifications.each(function(item) {
					notificationsTypes.push(item.type + "");
					if (this.notifications[item.type] == undefined) {
						this.addMessage(item);
					}
				}.bind(this));
				
				// remove deleted messages
				var deleteTypes = Object.keys(this.notifications).diff(notificationsTypes);
				deleteTypes.each(function(item) {
					this.removeMessage(item);
				}.bind(this));
				
				// save new hash
				this.hash = response.responseData.hash;
			}
			
			this.daemonMessages = {'jqdRestart': false, 'scdRestart': false, 'phpRestart': false};
			response.responseData.daemonMessages.each(function(message){
                
				if (message.key == 'jqd') {
                	this.daemonMessages.jqdRestart = true;
                } else if (message.key == 'scd') {
                	this.daemonMessages.scdRestart = true;
                } else if (message.key == 'PHP') {
                	this.daemonMessages.phpRestart = true;
                }

            }.bind(this));
		}
		
		if (this.interval > 0) {
			this.delayedTimer = this.getNotifications.delay(this.interval, this);
		}
	},
	
	open: function() {
		this.myKeyboardEvents.activate();
		this.content.removeClass('hidden');
		//var myVerticalSlide = new Fx.Slide(this.content);
		//myVerticalSlide.hide();
		//myVerticalSlide.slideIn();
	},

	close: function() {
		this.myKeyboardEvents.deactivate();
		this.content.addClass('hidden');
	},

	addMessage: function(item){
		var type = item.type;
		var title = item.title;
		var description = item.description;
		var fixUrl = item.url;
		
		this.notifications[type] = item;
		
		if (type == 1) { // == isState
			this._activateRestart();
			this._showRestartTip();
			return;
		}
		
		if (type == 22) { // restarting notification
			document.fireEvent('beginRestart', {});
			return;
		}
		
		var newMessage  = new Element('div', {id: 'message-' + type, 'class' : 'message'});
		newMessage.set('html', this._createNewMessage(type, type, title, description));
			
		// repeat action
		if (this.allowDismiss) {
			newMessage.getElement('select').addEvent('change', function(element) {
				this.sendUpdateNotification(type, element.target.get('value'));
				this.removeMessage(type);
			}.bind(this));
			
			if (newMessage.getElement('.dismissNotification')) {
				newMessage.getElement('.dismissNotification').addEvent('click', function(e) {
					this.sendDeleteNotification(type);
					this.removeMessage(type);
				}.bind(this));
			}
		}
		
		// details action
		if (this.allowDismiss) {
			if (fixUrl == '') {
				newMessage.getElement('.descriptionButton').dispose();
			} else {
				newMessage.getElement('.descriptionButton').addEvent('click', function(element) {
					window.location.href = baseUrl() + fixUrl;
				}.bind(this));
			}
		}
		
		// inject to page
		if (this._isState(type)) {
			newMessage.inject($('notification-msg-states'), 'top');
		} else {
			newMessage.inject($('notification-msg-messages'), 'top');
		}
		
		if (! this.content.hasClass('hidden')) {
			var myVerticalSlide = new Fx.Slide('message-' + type);
			myVerticalSlide.hide();
			myVerticalSlide.slideIn();
		}
		
		this.messageCount++;
		
		this.updateMessagesCount();
	},
	
	removeMessage: function(type) {
		delete this.notifications[type];
		
		if (type == 1) { // == isState
			this._deactivateRestart();
			this._hideRestartTip();
			Cookie.dispose('restart-tip');
		}
		
		if (type == 22) { // restarting notification
			this._stopRestartingAnimation();
			this.fireEvent('restartComplete');
			return;
		}
		
		if (! $('message-' + type)) {
			return;
		}
		
		if (! this.content.hasClass('hidden')) {
			var myVerticalSlide = new Fx.Slide('message-' + type);
			myVerticalSlide.slideOut();
			myVerticalSlide.addEvent('complete', function() {
				$('message-' + type).dispose();
				this.messageCount--;
				this.updateMessagesCount();
			}.bind(this));
		} else {
			$('message-' + type).dispose();
			this.messageCount--;
			this.updateMessagesCount();
		}
	},
	
	updateMessagesCount: function() {
		if (this.messageCount == 0) {
			this.iconCount.addClass('hidden');
			this.button.addClass('off');
			this.close();
			return;
		} 
		
		this.button.removeClass('off');
		this.iconCount.removeClass('hidden');
		this.iconCount.set('html', this.messageCount);
		
		var closeBtn = '<div class="dismiss" title="' + _t('Close notification') + '" onclick="notificationCenter.close();">x</div>';
		if (this.messageCount == 1) {
			$('pane-title').set('html', '1 ' + _t('Message') + closeBtn);
		} else {
			$('pane-title').set('html', this.messageCount + ' ' + _t('Messages') + closeBtn);
		}
	},
	
	_createNewMessage: function(id, type, title, description) {
		var result = '<div class="icon"></div> \
		<div class="body"> \
			<div class="title">' + title + '</div>';
			
		result  += '<div class="description">' + description + '</div>';
		
		if (this.allowDismiss) {
			result += '<div class="controls"> \
					<div class="buttons"> ';
			if (this._canBeDismissed(type)) {
				result += '<button onclick="return false;" class="dismissNotification">' + _t('Dismiss') + '</button>';
			}
	  		result += '	<button class="descriptionButton">' + _t('Details') + '</button> \
	  				<select> \
	  					<option>' + _t('Remind me in') + '</option> \
	  					<option value="60">' + _t('an hour') + '</option> \
	  					<option value="240">' + _t('a few hours') + '</option> \
	  					<option value="1440">' + _t('a day') + '</option> \
	  					<option value="10080">' + _t('a week') + '</option> \
	  				</select> \
					</div> \
				</div>';
		}
		
		result += '</div>';
		
		return result;
	},
	
	_canBeDismissed: function(type) {
		var canBeDismissed = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 32, 33, 36, 37, 500, 39, 40, 41, 42, 43, 44];
		return canBeDismissed.contains(type.toInt());
	},
	
	_isState: function(type) {
		if (type == 1) { // restart php
			return true;
		}
		
		return false;
	},
	
	_activateRestart: function() {
		this.restartNeeded = true;
		this.restartButton.addClass('active');
	},
	
	_deactivateRestart: function() {
		this.restartNeeded = false;
		this.restartButton.removeClass('active');
	},
	
	_showRestartTip: function() {
		var cookie = Cookie.read('restart-tip');
		if (cookie == null) {
			this.restartTip.show({target: this.restartButton});
			$$('.floating-tip-wrapper').setStyle('position', 'fixed');
		}
	},
	
	_hideRestartTip: function() {
		this.restartTip.hide({target: this.restartButton});
		this._disableTooltip();
	},
	
	_restartServers: function() {
		var restartingNotification = {type: 22, title: '', description: '', url: ''};
		this.addMessage(restartingNotification);
		this._startRestartingAnimation();
		
		document.fireEvent('toastNotification', {'message': _t('Server is restarting...')});
		
   		var url = baseUrl() + '/Api/restartPhp';
   		var params = {};
   		params.force = this.restartNeeded ? "FALSE" : "TRUE";
		var request = new Request.WebAPI({
    		method: 'post',
    		url: url,
    		version: '1.3',
    		onComplete: function(response) {
    		}.bind(this)
		}).post(params);
		document.fireEvent('beginRestart', {origin: this});
   	},
   	
   	_checkTasksComplete: function(rowId) {
   		var url = baseUrl() + '/Api/tasksComplete';
		var request = new Request.WebAPI({
    		method: 'get',
    		url: url,
    		data:{servers: [rowId]},
    		onComplete: function(response) {
        		if (undefined != response && response.responseData.tasksComplete == true) {
            		// finish all tasks
            		completeRowPolling(rowId);
        		}
    		}
		}).send();
   	},
   	
   	_startRestartingAnimation: function() {
   		this._hideRestartTip();
   		this.restartButton.addClass('restarting');
		this.restartButton.set('title', _t('Restarting...')); 
   	},
   	
   	_stopRestartingAnimation: function() {
   		this.restartButton.removeClass('restarting');
		this.restartButton.set('title', _t('Restart')); 
		document.fireEvent('toastNotification', {'message': _t('Server was successfully restarted') });
   	}
});

var NotificationCenterBlocking = new Class({
	'Extends': NotificationCenter,
	initialize: function(interval, allowRestart, allowDismiss) {
		this.parent(interval, allowRestart, allowDismiss);
		
		document.addEvent('beginRestart', function(event) {
			$$('body').spin({'class': 'spinner-large', 'message': _t('Please wait while Zend Server restarts...')});
		});
		
		this.addEvent('restartComplete', function(event) {
			$$('body').unspin();
		});
	}
});