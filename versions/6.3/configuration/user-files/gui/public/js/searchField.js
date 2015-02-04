var SearchField = new Class({
	Implements: [Events, Options],
	
	className: 'searchField',
	myKeyboardEvents: null,
	
	getOptions: function(){
		return {
			clearButton: true,
		};
	},
	
	initialize: function(className, options){
		this.setOptions(this.getOptions(), options);
		
		if (className) {
			this.className = className;
		}
		this._render();
		
		this.myKeyboardEvents = new Keyboard({
		    defaultEventType: 'keyup',
		    events: {
		        '/': function(e) {
		        	if (e.target.nodeName != 'INPUT' && e.target.nodeName != 'TEXTAREA') {
		        		$$('.searchBox .search').pick().setFocus();
		        	}
		        }.bind(this)
		    }
		});
		this.myKeyboardEvents.activate();
	},
	
	_render: function() {
		className = this.className;
		
		$$('.' + className).each(function(item) {
			var wrapperForm = new Element('form', {'onsubmit': 'return false;'});
			var searchBox = new Element('div', {'class': 'searchBox'});
			if (item.get('id')) {
				searchBox.set('id', item.get('id') + '_wrapper');
			}
			var searchInput = new Element('input', {'class': 'search', 'type': 'text'});
			if (item.get('id')) {
				searchInput.set('id', item.get('id') + '_input');
			}
			if (item.get('placeholder')) {
				searchInput.set('placeholder', item.get('placeholder'));
			}
			if (item.get('disable') == 'true') {
				searchInput.set('disabled', true);
			}
			
			var selectSearch = new Element('a', {'class': 'selectSearch', 'id': 'freeText', 'title': 'search', 'href': 'javascript:void(0);'});
			selectSearch.addEvent('click', function() {
				this.fireEvent('searchClicked', {'value': searchInput.get('value'), 'element': searchInput});
			}.bind(this));

			var clearSearch = new Element('a', {'class': 'clearSearch hidden', 'title': 'clear', 'href': 'javascript:void(0);'});
			clearSearch.addEvent('click', function() {
				searchInput.set('value', '');
				selectSearch.removeClass('hidden');
				clearSearch.addClass('hidden');
				this.fireEvent('searchClicked', {'value': searchInput.get('value'), 'element': searchInput});
			}.bind(this));
			
			searchInput.addEvent('keyup', function(event){
				if (event.code == 13) { // enter
					this.fireEvent('searchClicked', {'value': searchInput.get('value'), 'element': searchInput});
				} else if (event.code == 27) { // esc
					searchInput.set('value', '');
					this.fireEvent('searchClicked', {'value': searchInput.get('value'), 'element': searchInput});
				}
				
				if (this.options.clearButton) {
					if (searchInput.get('value').trim() != '') { // input have content
						selectSearch.addClass('hidden');
						clearSearch.removeClass('hidden');
					} else { // input is cleared
						selectSearch.removeClass('hidden');
						clearSearch.addClass('hidden');
					}
				}
			}.bind(this));
			
			
			searchBox.inject(wrapperForm);
			searchInput.inject(searchBox);
			selectSearch.inject(searchBox);
			clearSearch.inject(searchBox);
			
			wrapperForm.inject(item, 'after');
		}.bind(this));
	}
});