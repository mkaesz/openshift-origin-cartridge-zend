var zGrid = new Class({
	Implements: [Events,Options],
	
	order: 			null,
	sortColumn:		null,
	appId:			null,
	page:			1,
	callbacks:		null,
	menu:			null,
	
	getOptions: function(){
		return {
			url:		null,
			columnModel:	null,
			dataProvider:	null,
			limit: 		10,
			filterId: 	null,
			descHandler:	null,
			dataStructure:	null,
			idColumn:		'id',
			sortedBy:		'rule',
			direction: 		'asc',
			params:			null,
			data: 			new Array()
		};
	},
	
	initialize: function(container, options){
		this.setOptions(this.getOptions(), options);
		this.container = $(container);
		
		if (!this.container)
			return;
		
		this.callbacks = new Array();
		
		this.container.setStyle('position', 'relative');
		
		// create table
		var table = new Element('table', {id: container + '_table', 'class': 'zgrid'});
		var tableHead = new Element('thead', {id: container + '_tableHead'});
		var tableBody = new Element('tbody', {id: container + '_tableBody'});
		
		var tableRow = this.createTableRow(tableHead, {background: "gray"});
		
		// create table headers
		this.options.columnModel.each(function(col) {
			var headCol;
			var colWidth = this.container.getSize().x * col.width.toInt() / 100;
			
			if (col.dataType == "menu" ||
				col.dataType == "descriptionIndicator" ||
				col.dataType == "button") {
				if (col.dataType == "menu") {
					this.menu = new zMenu();
				}
				headCol = this.createTableColumn('th', tableRow, '', {width: colWidth});
			} else {
				headCol = this.createTableColumn('th', tableRow, col.header, {width: colWidth});
				if (col.seperator) {
					seperator = new Element('div', {'class': 'grid-header-seperator'});
					seperator.inject(headCol);
				}
			}
			
			if (col.sortable) {
				headCol.addEvent('click', function(event) {this.sortGrid(headCol, col.sortBy, true);}.bind(this));
				headCol.toggleClass('sortable');
				
				if (col.dataIndex == this.options.sortedBy) {
					this.sortGrid(headCol, col.sortBy, false, this.options.direction);
				}
			}
		}.bind(this));
		
		tableHead.inject(table);
		tableBody.inject(table);
		
		// create spinner
		var spinner = new Element('div', {id: 'grid-spinner', 'class': 'hidden'});
		spinner.inject(table);
		var spinnerImg = new Element('div', {id: 'grid-spinner-img', 'class': 'hidden'});
		spinnerImg.inject(table);
		
		table.inject(this.container);
		
		this.tableCont = $(container + "_table");
		this.tableBody = $(container + "_tableBody");
	},
	
	sortGrid: function(column, order, reload, direction) {
		// remove all sort direction images if exists
		$$('.zgrid .direction-asc').dispose();		
		$$('.zgrid .direction-desc').dispose();
		
		if (this.order == order) {
			this.toggleSortDirection();
		} else {
			// remove old sorted class
			if (this.sortColumn) {
				this.sortColumn.removeClass("sorted");
			}
			
			column.addClass("sorted");
			this.sortColumn = column;
			this.order = order;
			if (direction) {
				this.direction = direction;
			} else {
				this.direction = 'asc';
			}
		}
		
		var sortImage = new Element('span', {'class': 'direction-' + this.direction});
		sortImage.inject(column);
		
		if (reload) {
			this.page = 1;
			this.loadData();
		}
	},
	
	toggleSortDirection: function() {
		if (this.direction == 'asc') {
			this.direction = 'desc';
		} else {
			this.direction = 'asc';
		}
	},
	
	/**
	 * Handler that called when a new page is selected
	 * @param params
	 */
	reloadData: function(params) {
		if (params.page) {
			this.page = params.page.toInt();
		}
		
		if (params.appId) {
			this.appId = params.appId;
		}
		
		this.loadData();
	},
	
	/**
	 * Handler for data that have been received from ajax request
	 * @param data
	 */
	onLoadData: function (data)
	{
		if (data) {
			this.reset();
			var theData = data;
			this.options.dataStructure.split('.').each(function(item) {
				theData = theData[item];
			});
			this.setData(theData);
			$('grid-spinner').addClass('hidden');
			$('grid-spinner-img').addClass('hidden');
		
			// fire loadData event
			this.fireEvent('loadData', {page: this.page, total: data.responseData.totalCount, itemsPerPage: this.options.limit});
			
			var hash = this.getHash('grid');
			if (hash) {
				hash.split(',').each(function(item) {
					this.expandRow(item);
				}.bind(this));
			}
		}
	},
	
	/**
	 * Retrieve data from ajax request
	 */
	loadData: function ()
	{	
		$('grid-spinner').removeClass('hidden');
		$('grid-spinner-img').setStyle('left', (this.container.getSize().x / 2) - 24);
		$('grid-spinner-img').setStyle('top', (this.container.getSize().y / 2) - 24);
		$('grid-spinner-img').removeClass('hidden');
		
		// must clone the object in order not to change the original object
		var params = Object.clone(this.options.params);
		
		params.limit = this.options.limit;
		
		if (this.page > 1) {
			params.offset = (this.page - 1) * this.options.limit;
		}
		
		if (this.order) {
			params.order = this.order;
			params.direction = this.direction.toUpperCase();
		}
		
		if (this.appId) {
			params.filters = new Object();
			params.filters.appId = new Array();
			params.filters.appId.push(this.appId);
		}
		
		if (this.options.filterId) {
			params.filterId = this.options.filterId;
		} 
		
		if (this.options.type) {
			params.type = this.options.type;
		} 		
		
		var url = this.options.url;
		var request = new Request.WebAPI({url:url, data:params});

		request.addEvent("complete", this.onLoadData.bind(this) ) ;

		request.get();
	}, 
	
	/**
	 * Reset the table body
	 */
	reset: function() {
		this.tableBody.set('html', '');
	},
	
	/**
	 * Sets the data rows inside table body
	 * @param data
	 */
	setData: function(data)
	{
		
		if (!data || data.length == 0) {
			var tableRow = this.createTableRow(this.tableBody);
			this.createNoDataRow(tableRow, this.options.columnModel.length);
			
			return;
		}
		
		this.options.data = data; 

		var rowCounter = 0;
		
		data.each(function(row) {
			var rowId = this.getRowId(row);
			var tableRow = this.createTableRow(this.tableBody);
			tableRow.setAttribute('id', "tableRow_" + rowId);
			
			// add description row
			var tableDescRow = this.createTableRow(this.tableBody);
			tableDescRow.setAttribute('id', "tableDescRow_" + rowId);
			tableDescRow.addClass("tableDescRow");
			tableDescRow.addClass("hidden");
			
			if (rowCounter % 2 == 0) {
				tableRow.toggleClass("odd");
			} else {
				tableRow.toggleClass("even");
			}
			
			tableRow.addEvent('mouseenter', function() {
				this.activateRow(tableRow, rowId);
			}.bind(this));
			
			tableRow.addEvent('mouseleave', function() {
				this.deactivateRow(tableRow, rowId);
			}.bind(this));
			
			rowCounter++;
			
			this.options.columnModel.each(function(col) {
				if (col.dataType == "menu") {
					this.createMenu(tableRow, col, row);
				} else if(col.dataType == "html") {
					this.createHtmlColumn(tableRow, col, row);
				} else if(col.dataType == "button") {
					this.createButton(tableRow, col, row);
				} else if(col.dataType == "callback") {
					this.createCallback(tableRow, col, row);
				} else if (col.dataType == "descriptionIndicator") {
					this.createDescriptionIndicator(tableRow, col, row);
				} else if (col.dataType == "date") {
					this.createDate(tableRow, col, row);
				} else if (col.dataType == "boolean") {
					this.createYesNo(tableRow, col, row);
				} else {
					this.createNormalColumn(tableRow, col, row);
				}			
			}.bind(this));
			
			var descCol = this.createTableColumn('td', tableDescRow, '', {});
			descCol.setAttribute('colSpan', this.options.columnModel.length);
			descCol.set('id', 'descItemTr_' + rowId);
		}.bind(this));
	},
	
	/**
	 * return rowId for given row 
	 * @param row
	 */
	getRowId: function(row) {
		return this.cleanId(row[this.options.idColumn] + '');
	},
	
	/**
	 * return cleaned id without spaces 
	 * @param id
	 */
	cleanId: function(id) {
		return id.replace(/ /g, '--');
	},
	
	/**
	 * Create column that gets her data from callback specefied by id
	 * @param tableRow
	 */
	createNoDataRow: function(tableRow, columnsCount) {
		var tableColumn = new Element('td');
		tableColumn.set('html', _t('No results were found. '));
		tableColumn.set('colspan', columnsCount);
		tableRow.addClass("odd");
		var reload = new Element('a', {html: _t('Refresh'), href: 'javascript:void(0);'});
		reload.addEvent('click', function() { this.loadData() }.bind(this));
		reload.inject(tableColumn);
		
		tableColumn.inject(tableRow);
	},
	
	/**
	 * Create column that gets her data from callback specefied by id
	 * @param tableRow
	 * @param col
	 * @param row
	 */
	createButton: function(tableRow, col, row) {
		var column = this.createTableColumn('td', tableRow, '', {width: col.width});
		column.addClass('no-padding');
		var dataIndex = col.dataIndex;
		var image = new Element('div', {'class' : 'hidden zgrid_btn ' + dataIndex, id: dataIndex + '_' + this.getRowId(row)});
		image.setProperty('title', col.header);
		image.inject(column);
		
		image.addEvent('click', function() { this.callbacks[dataIndex](image.get('id'), row); }.bind(this));
	},
	
	/**
	 * Create column that gets her data from callback specefied by id
	 * @param tableRow
	 * @param col
	 * @param row
	 */
	createCallback: function(tableRow, col, row) {
		var column = this.createTableColumn('td', tableRow, row[col.dataIndex], {width: col.width});
		column.set('html', this.callbacks[col.dataIndex](row[col.dataIndex], row));
		
		if (! col.dontExpand) {
			column.addEvent('click', function() {this.expandRow(this.getRowId(row));}.bind(this));
		}
	},
	
	/**
	 * Create date column
	 * @param tableRow
	 * @param col
	 * @param row
	 */
	createDate: function(tableRow, col, row) {
		theDate = formatDate(dateFromISO8601(row[col.dataIndex]));
		var column = this.createTableColumn('td', tableRow, theDate, {width: col.width});
		
		if (! col.dontExpand) {
			column.addEvent('click', function() {this.expandRow(this.getRowId(row));}.bind(this));
		}
	},
	
	/**
	 * Create boolean column
	 * @param tableRow
	 * @param col
	 * @param row
	 */
	createYesNo: function(tableRow, col, row) {
		var boolean = row[col.dataIndex] ? _t('Yes') : _t('No');
		var column = this.createTableColumn('td', tableRow, boolean, {width: col.width});
	
		if (! col.dontExpand) {
			column.addEvent('click', function() {this.expandRow(this.getRowId(row));}.bind(this));
		}
	},
	
	/**
	 * Create description indicator column
	 * @param tableRow
	 * @param col
	 * @param row
	 */
	createDescriptionIndicator: function(tableRow, col, row) {
		var tableColumn = new Element('td', {id: "descItem_" + this.getRowId(row), 'class': "tableDescClosed", styles: {width: col.width}});
		tableColumn.addEvent('click', function() {this.expandRow(this.getRowId(row));}.bind(this));
		tableColumn.inject(tableRow);
	},
	
	/**
	 * Create normal column
	 * @param tableRow
	 * @param col
	 * @param row
	 */
	createHtmlColumn: function(tableRow, col, row) {
		var column = this.createTableColumn('td', tableRow, row[col.dataIndex], {width: col.width});
		
		if (! col.dontExpand) {
			column.addEvent('click', function() {this.expandRow(this.getRowId(row));}.bind(this));
		}
	},
	
	/**
	 * Create normal column
	 * @param tableRow
	 * @param col
	 * @param row
	 */
	createNormalColumn: function(tableRow, col, row) {
		var column = this.createStringTableColumn('td', tableRow, row[col.dataIndex], {width: col.width});
		
		if (! col.dontExpand) {
			column.addEvent('click', function() {this.expandRow(this.getRowId(row));}.bind(this));
		}
	},
	
	/**
	 * Create menu column
	 * @param tableRow
	 * @param col
	 * @param row
	 */
	createMenu: function(tableRow, col, row) {
		this.menu.createMenu(tableRow, this.getRowId(row));
	},
	
	registerCallback: function(id, callback) {
		this.callbacks[id] = callback;
	},
	
	createTableRow: function(parent, styles) {
		var tableRow = new Element('tr');
		tableRow.setStyles(styles);
		
		tableRow.inject(parent);
		
		return tableRow;
	},
	
	activateRow: function(tableRow, id) {
		if (this.menu) {
			this.menu.showMenu(id);
		}
		$('tableDescRow_' + id).addClass('tableDescRowOver');
		$$('#' + tableRow.get('id') + ' .zgrid_btn').removeClass('hidden');
	},
	
	deactivateRow: function(tableRow, id) {
		if (this.menu) {
			this.menu.hideMenu(id);
		}
		$('tableDescRow_' + id).removeClass('tableDescRowOver');
		$$('#' + tableRow.get('id') + ' .zgrid_btn').addClass('hidden');
	},

	createTableColumn: function(type, parent, html, styles) {
		var tableColumn = new Element(type);
		tableColumn.set('html', html);
		tableColumn.setStyles(styles);
		
		tableColumn.inject(parent);
		return tableColumn;
	},
	
	createStringTableColumn: function(type, parent, html, styles) {
		var tableColumn = new Element(type);
		tableColumn.set('text', html);
		tableColumn.setStyles(styles);
		
		tableColumn.inject(parent);
		return tableColumn;
	},
	
	menuItemClick: function(item) {
	},
	
	expandRow: function(item) {
		if (! $("tableRow_" + item)) {
			return;
		}
		
		if (! $("tableDescRow_" + item).hasClass('hidden')) {
			var myVerticalSlide = new Fx.Slide('tableDescContent_' + item);
			myVerticalSlide.addEvent('complete', function() {
				$("tableDescRow_" + item).toggleClass("hidden");
			});
			myVerticalSlide.slideOut();
		} else {
			$("tableDescRow_" + item).toggleClass("hidden");
		}
		
		$("tableRow_" + item).toggleClass("active");
		
		$("descItem_" + item).toggleClass("tableDescClosed");
		$("descItem_" + item).toggleClass("tableDescOpened");
		
		if ($("tableRow_" + item).hasClass('active')) {
			this.fireEvent('descriptionOpen', {id: item, prefix: 'descItemTr_'});
			this.addHash('grid', item);
		} else {
			this.fireEvent('descriptionClose', {id: item, prefix: 'descItemTr_'});
			this.removeHash('grid', item);
		}
	},
	
	getHash: function(name) {
		parsed = window.location.hash.substring(1).parseQueryString();

		if (parsed[name] && parsed[name] != '') {
			return parsed[name];
		}
		
		return '';
	},
	
	addHash: function(name, hash) {
		var currHash = this.getHash(name);
		
		if (! currHash.contains(hash, ',')) {
			if (currHash == '') { // current hash is empty
				currHash = hash;
			} else {
				currHash += ',' + hash;
			}
		}
		
		this.setHash(name, currHash);
	},
	
	setHash: function(name, hash) {
		parsed = window.location.hash.substring(1).parseQueryString();
		parsed[name] = hash;
		
		if (hash == '') {
			delete parsed[name];
		}
		
		delete parsed['']; // remove the empty hash
		hash = Object.toQueryString(parsed).replace(/%2C/g, ',');
		
		window.location.hash = hash;
	},
	
	removeHash: function(name, hash) {
		var currHash = this.getHash(name);
		
		var splitted = currHash.split(',');
		splitted.each(function(item, index) {
			if (item == hash) {
				splitted.splice(index, 1);
			}
		});

		hash = splitted.join(',');
		
		this.setHash(name, hash);
	}
	
});