var valuesList = new Class({
		'Implements': [Options, Events],
		'options': {
			'delimiter': ',',
			'readonly': false
		},
		'node': null,
		'items': [],
		'list': null,
		'initialize': function(node, options){
			if (typeof node == 'object') {
				this.node = node;
			} else {
				this.node = $(node);
			}

			if (options) {
				this.setOptions(options);
			}
			
			var items = [];
			/// parse values into list
			if (this.node.value != '') {
				items = this.node.value.split(this.options.delimiter);
			}

			this.list = new Element('ul', {'class': 'flat-list'});
			this.node.getParent().adopt(this.list);

			items.each(function(item){
				this.add(item);
			}.bind(this));
		},
		'add': function(item) {
			if (this.items.contains(item)) {
				return false;
			}
			this.items.push(item);
			this._rewriteStorage();
			
			this._addDomNode(item);
			
			this.fireEvent('addItem', {item: item});
			return true;
		},
		'remove': function(item) {
			this.items.erase(item);
			this._rewriteStorage();
			this.fireEvent('removeItem', {item: item});
		},
		'_rewriteStorage': function() {
			this.node.value = this.items.join(this.options.delimiter);
		},
		'_addDomNode': function(item) {
			var listItem = new Element('li');
			var span = new Element('span', {'class': 'tag'});
			span.appendText(item);
			if (this.options.readonly) {
				span.addClass('readonly');
			}
			listItem.appendChild(span);
			this.list.appendChild(listItem);

			if (! this.options.readonly) {
				span.addClass('remove');
				span.addEvent('click', function(event) {
					this.remove(event.target.get('text'));
					/// remove li and span
					event.target.getParent().dispose();
				}.bind(this));
			}
		}
		
	});