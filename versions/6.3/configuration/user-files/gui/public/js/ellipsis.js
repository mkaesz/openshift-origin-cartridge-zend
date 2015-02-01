Element.implement({
    ellipsis: function(type) {
    	new ellipsis(this, type);
    }
});

var ellipsis = new Class({
	lognText: '',
	type: 'end',
	
	initialize: function(container) {
		if (container.retrieve('longText') == null) {
			this.longText = container.get('html');
			container.store('longText', this.longText);
			container.set('rel', this.longText);
		} else {
			this.longText = container.retrieve('longText');
		}
		
		this.longText = this.clean(this.longText);
		
		var type = container.get('ellipsis');
		switch (type) {
			case 'front':
				this.type = 'front';
				break;
			case 'end':
				this.type = 'end';
				break;
			default:
				this.type = 'center';
				break;
		}
		
		//container.ellipsis();
		this.ellipsis(container);
	},
	
	ellipsis: function(container) {
        if(container.getStyle("overflow") == "hidden") {
        	var text = this.longText;
        	container.set('html', text);
            var multiline = container.hasClass('multiline');
            var t = container.clone()
                .setStyle('display', 'none')
                .setStyle('position', 'absolute')
                .setStyle('overflow', 'visible')
                .setStyle('width', multiline ? container.getSize().x : 'auto')
                .setStyle('height', multiline ? 'auto' : container.getSize().y)
                .inject(container, 'after');
            
            function height() { return t.measure(t.getSize).y > this.getSize().y; };
            function width() { return t.measure(t.getSize).x > this.getSize().x - 20; };
            var func = multiline ? height.bind(container) : width.bind(container);

            
            while (text.length > 0 && func()) {
            	if (this.type == 'end') {
            		text = text.substr(0, text.length - 1);
            	} else if (this.type == 'front') {
            		text = text.substr(1, text.length - 1);
            	} else {
            		text = text.substr(0, text.length/2 - 1) + text.substr(text.length/2 + 1);
            	}
                t.set('html', text);
            }
            
            var imploded = '';
            if (t.get('text').length < this.longText.length) {
            	if (this.type == 'end') {
                	imploded = t.get('text') + ' ...';
                } else if (this.type == 'front') {
                	imploded = '... ' + t.get('text');
                } else {
                	var smallText = t.get('text');
                	imploded = this.longText.substr(0, (smallText.length / 2) - 3) + ' ... ' + this.longText.substr(this.longText.length - (smallText.length / 2) + 5);
                }
        	} else {
        		imploded = this.longText;
        	}
            
            t.dispose();
            
            container.set('html', imploded);
            if (imploded != this.longText) {
	            if (! container.get('id')) {
	            	container.set('id', 'ellipsis_' + container.getPosition().x + container.getPosition().y);
	            }
	            
	            var long = this.longText;
	            var tip = new FloatingTips('#' + container.get('id'), {
	        		// Content can also be a function of the target element!
	            	showDelay: 800,
	            	hideDelay: 500,
	        		content: 'rel',
	        		position: 'bottom', // Bottom positioned
	        		center: true, // Place the tip aligned with target
	        		arrowSize: 8, // A bigger arrow!
	        		distance: -22,
	        		hideOn: 'null'
	        	});
	            
	            tip.addEvent('show', function() {
	        		$$('.floating-tip-wrapper').each(function(item) {
	                	item.addEvent('mouseleave', function() {
	                		tip._animate(item, 'out');
	                    }.bind(this));
	            	}.bind(this));
	            }.bind(this));
            }
        }
    },
    
    clean: function(value) {
		var cleaner = new Element('div');
		cleaner.set('text', value);
		
		return cleaner.get('html');
	}
});