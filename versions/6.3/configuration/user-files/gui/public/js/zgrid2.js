var zGrid2 = new Class({
	Implements: [Events,Options],
	
	data:			{},
	columnsOrder: 	[],
	page:		  	1,
	tableSpinner: 	null,
	order: 		  	null,
	appId:			null,
	order: 			null,
	checkedList:	[],
	buttons:		[],
	columnModel:	null,
	noData:			false,
	actionsWidth:	0,
	totalRows:		0,
	useReloadZebra:	true,
	fragment: null,
	loadRequest: null,
	getOptions: function(){
		return {
			idColumn:		'id',
			limit: 			20,
			sortedBy:		'',
			direction: 		'asc',
			description:	true,
			rowExpand:		true,
			multiSelect:	false,
			menu:			null,
			totalContainer:	null,
			totalLabel:		_t('Shown:'),
			
			// elements names
			tableDescContent: 'tableDescContent_',
			tableRow:		  'tableRow_'
		};
	},
	
	initialize: function(container, columnModel, options){
		this.setOptions(this.getOptions(), options);
		this.container = $(container);
		this.fragment = new FragmentManager();
		if (!this.container)
			return;
		
		if (this.options.menu != null && typeof this.options.menu == 'string') {
			this.options.menu = eval(this.options.menu);
		}
		
		this.columnModel = columnModel;
		
		// mofidy the column model to have a lead key from dataIndex column
		var newColumnModel = new Object();
		Object.each(this.columnModel, function(item) {
			if (item.parser == zGrid2.prototype.button) {
				this.buttons.push(item);
			} else {
				newColumnModel[item.dataIndex] = item;
				this.columnsOrder.push(item.dataIndex);
			}
		}.bind(this));
		this.columnModel = newColumnModel; 
		
		this.container.setStyle('position', 'relative');
		
		// create table
		var table = new Element('table', {id: container + '_table', 'class': 'zgrid'});
		var tableHead = new Element('thead', {id: container + '_tableHead'});
		var tableBody = new Element('tbody', {id: container + '_tableBody'});
		
		var tableRow = this.createTableRow(tableHead);
		
		if (this.options.multiSelect) {
			var checkboxColumn = this.createTableColumn('th', tableRow, '');
			seperator = new Element('div', {'class': 'grid-header-seperator'});
			seperator.inject(checkboxColumn);
			checkboxColumn.setStyle('width', '25px');
			
			var checkboxElement = new Element('input', {type: 'checkbox'});
			checkboxElement.setStyle('display', 'block');
			checkboxElement.setStyle('margin-top', '3px');
			checkboxElement.setStyle('margin-right', '10px');
			checkboxElement.inject(checkboxColumn);
			
			checkboxElement.addEvent('click', function(event) {
				if (event.target.get('checked')) {
					$$('tbody tr[id^="tableRow"] .zgrid-checkbox').each(function(item) {
						if (! item.get('disabled')) {
							item.set('checked', true);
						}
					});
					$$('tbody tr[id^="tableRow"] .zgrid-checkbox').fireEvent('click');
				} else {
					$$('tbody tr[id^="tableRow"] .zgrid-checkbox').each(function(item) {
						if (! item.get('disabled')) {
							item.set('checked', false);
						}
					});
					$$('tbody tr[id^="tableRow"] .zgrid-checkbox').fireEvent('click');
				}
			});
		}
		
		/// calculate actions width
		var actionsWidth = 0;
		
		// add width of description indicator
		if (this.options.rowExpand) {
			actionsWidth += 20;
		}
		// add width of buttons
		actionsWidth += this.buttons.length * 35;
		// add width of menu
		if (this.options.menu != null) {
			actionsWidth += 20;
		}

		// set minimum width to show label
		actionsWidth = Math.max(45, actionsWidth);
		this.actionsWidth = (actionsWidth + 10);
		
		var staticWidth = 0;
		Object.each(this.columnModel, function(item) {
			if (item.width.contains('px')) {
				staticWidth += item.width.toInt(); 
			}
		});
		
		this.staticWidth = staticWidth;
		
		var containerSize = this.container.getSize().x - this.actionsWidth - staticWidth;
		// add checkbox column
		if (this.options.multiSelect) {
			containerSize -= 35;
		}
		
		// create table headers
		Object.each(this.columnModel, function(col) {
			// create column to every type except buttons and menus
			if (col.parser != zGrid2.prototype.button) { 
				var headCol;
				if (col.width.contains('px')) {
					var colWidth = col.width.toInt() - 10;
				} else {					
					var colWidth = Math.floor(containerSize * col.width.toInt() / 100) - 10;
				}
				
				if (!col.tooltip) {
					col.tooltip = col.title;
				}
				
				headCol = this.createTableColumn('th', tableRow, col.title, {width: colWidth}, {title: col.tooltip, 'class': 'zgrid_header zgrid_header-' + col.dataIndex});
				headCol.set('originalWidth', col.width);
				if (col.center) {
					headCol.setStyle('text-align', 'center');
				}
				if (col.useTooltipWidget) {
					headCol.addClass('unsupported-tip');
				}
				
				// check if seperator is needed
				if (col.headerSeperator !== false) {
					seperator = new Element('div', {'class': 'grid-header-seperator'});
					seperator.inject(headCol);
				}
				
				if (col.sortable) {
					headCol.addEvent('click', function(event) {this.sortGrid(headCol, col.sortBy, true);}.bind(this));
					headCol.toggleClass('sortable');
					
					if (col.dataIndex == this.options.sortedBy) {
						this.sortGrid(headCol, col.sortBy, false, this.options.direction);
					}
				}
			}
		}.bind(this));
		
		// create actions column
		var actionsColumn = this.createTableColumn('th', tableRow, '');
		
		// add width of description indicator
		if (this.options.rowExpand) {
			var descIndicator = new Element('span', {'class': 'tableDescClosed'});
			actionsColumn.setStyle('display', 'block');
		}
		
		// add width of buttons
		if (this.buttons.length > 0) {
			actionsColumn.set('text', 'Actions');
		}
		
		// set the width
		actionsColumn.setStyle('width', actionsWidth + 'px');
		
		tableHead.inject(table);
		tableBody.inject(table);
		
		table.inject(this.container);
		
		this.tableCont = $(container + "_table");
		this.tableBody = $(container + "_tableBody");
		this.tableHead = $(container + "_tableHead");
		
		//create table spinner
		this.tableSpinner = new Spinner(this.tableBody, {'class': 'spinner-large'});
		this.addEvent('updateComplete', function() {
			this.postLoad();
			window.fireEvent('resize');
		});
		
		window.addEvent('resize', function(){
			this._reRender();
		}.bind(this));
	},
	
	///////////  PUBLIC METHODS /////////////
	
	_reRender: function() {
		var containerSize = this.container.getSize().x - this.actionsWidth - this.staticWidth;
		// add checkbox column
		if (this.options.multiSelect) {
			containerSize -= 35;
		}
		
		this.tableHead.getElements('th').each(function(item) {
			if (item.get('originalwidth') != null) {
				if (item.get('originalwidth').contains('px')) {
					var colWidth = item.get('originalwidth').toInt() - 10;
				} else {
					var colWidth = Math.floor(containerSize * item.get('originalwidth').toInt() / 100) - 10;					
				}
				item.setStyle('width', colWidth);
			}
		});
		
		$$('#persistant-wrapper #mytable_tableHead th').each(function(item) {
			if (item.get('originalwidth') != null) {
				if (item.get('originalwidth').contains('px')) {
					var colWidth = item.get('originalwidth').toInt() - 10;
				} else {
					var colWidth = Math.floor(containerSize * item.get('originalwidth').toInt() / 100) - 10;					
				}
				item.setStyle('width', colWidth);
			}
		});
		
		containerSize = this.container.getSize().x - this.actionsWidth - this.staticWidth;
		this.tableBody.getElements('td').each(function(item) {
			if (item.get('originalwidth') != null) {
				if (item.get('originalwidth').contains('px')) {
					var colWidth = item.get('originalwidth').toInt() - 10;
				} else {
					var colWidth = Math.floor(containerSize * item.get('originalwidth').toInt() / 100) - 10;					
				}
				item.setStyle('width', colWidth);
			}
		});
	},
	
	/**
	 * Handler that called when a new page is selected
	 * @param params
	 */
	reloadData: function(params) {
		if (params.page) {
			this.page = params.page.toInt();
		}
		
		this.loadData();
	},
	
	/**
	 * @param integer rowId - the row id to move
	 * @param integer nearId - the row id to move near to
	 * @param string position - the position relativly to near row. can be 'top', 'bottom', 'after' or 'before'
	 */
	moveRow: function(rowId, nearId, position) {
		if ($('tableRow_' + rowId) && $('tableRow_' + nearId)) {
			$('tableRow_' + rowId).inject($('tableRow_' + nearId), position);
			if (this.options.description) {
				$('tableDescRow_' + rowId).inject($('tableRow_' + rowId), 'after');
			}
			
			fireEvent('rowMoved', {rowId: rowId});
		}
	},
	
	getRowData: function(rowId) {
		if (this.data[rowId]) {
			return this.data[rowId];
		}
		
		return null;
	},
	
	/**
	 * Create a new grid with data supplied. Old grid data will be deleted
	 */
	setData: function(data, totalElements) {
		this.reset();
		
		// no data supplied
		if (!data || data == '' || data == null || data.length == 0) {
			if (this.page > 1) {
				this.page = 1;
				return this.loadData();
			}
			this.createNoDataRow();
		} else {
			this.updateData(data);
		}
		
		if (totalElements) {
			this.totalRows = totalElements.toInt(); 
		} else {
			this.totalRows = data.length;
		}
		
		this._updateTotalRows();
		
		this.fireEvent('updateComplete', {data: data});
	},
	
	preLoad: function() {
		if (this.tableSpinner.hidden) {
			this.tableSpinner.show();
		}
	},
	
	postLoad: function() {
		this.tableSpinner.hide();
	},
	
	/**
	 * Update grid with data. Existing rows will be updated and new rows will be added
	 * @parameter array data - The data array
	 * @parameter string position - The location of the new rows that need to be added (top / bottom)
	 */
	updateData: function(data, position) {
		this.useReloadZebra = false;
		data.each(function(rowData) {
			if (position) {
				this.setRow(rowData, position);
			} else {
				this.setRow(rowData);
			}
		}.bind(this));
		
		var hash = this.getHash('grid');
		if (hash && this.options.rowExpand) {
			hash.each(function(item) {
				if ($('tableRow_' + item) && ! $('tableRow_' + item).hasClass('active')) {
					this.activateRow(item);
					this.expandRow(item, this.data[item]);
				}
			}.bind(this));
		}
		this.reloadZebra();
		this.useReloadZebra = true;
		this.fireEvent('updateComplete', {data: data});
	},
	
	// This method deletes all rows that are not received in the data parameter
	// and update others
	overrideData: function(data, position, totalCount) {
		if (typeof totalCount == 'undefined') {
			totalCount = this.totalRows;
		}
		// pick up all currect grid ids
		var dataRows = [];
		data.each(function(row) {
			dataRows.push(this.getRowId(row));
		}.bind(this));
		
		// delete all rows that not exists in the data
		Object.each(zgrid2.getRowsData(), function(row, key) {
			if (!isNaN(key) && ! dataRows.contains(key)) {
				this.deleteRow(key);
			}
		}.bind(this));
		
		if (data.length > 0) {
			// update all rows
			this.updateData(data, position);
		} else if (! this.noData) {
			this.createNoDataRow();
		}
		this.totalRows = totalCount;
		this._updateTotalRows();
		this.fireEvent('overrideComplete', {data: data});
	},
	
	/**
	 * Set single row data. If row exists it will update it, otherwise it will add new row
	 */
	setRow: function(rowData, type, nearId, rowExpand) {
		if (this.noData) {
			this.reset();
		}
		
		var rowId = this.getRowId(rowData);
		this.data[rowId] = rowData;
		
		if ($("tableRow_" + rowId)) {
			this.updateRow(rowData);
		} else {
			this.setNewRow(rowData, type, nearId, rowExpand);
			this._updateTotalRows(1);
		}
		
		if (this.useReloadZebra) {
			this.reloadZebra();
		}
		
		this.fireEvent('rowUpdated', {id: rowId, data: rowData});
	},
	
	deleteRow: function(rowId) {
		if (! $('tableRow_' + rowId)) {
			return;
		}
		
		$('tableRow_' + rowId).dispose();
		
		if ($('tableDescRow_' + rowId)) {
			$('tableDescRow_' + rowId).dispose();
		}
		
		delete this.data[rowId];
		
		this._updateTotalRows(-1);
		
		this.fireEvent('rowDeleted', {id: rowId});
		this.fireEvent('rowChecked', {checked: false});
		if (0 == this.data.length) {
			if (this.page > 1) {
				this.page --;
				return this.loadData();
			}
			this.createNoDataRow();
			this.fireEvent('listEmptied'); // indicate that the list is now empty
		}
	},
	
	expandRow: function(rowId, rowData) {
		if (! $('tableRow_' + rowId)) {
			return;
		}
		
		if ($('tableDescRow_' + rowId)) {
			if (! $('tableDescRow_' + rowId).hasClass('hidden')) {
				var myVerticalSlide = new Fx.Slide(this.options.tableDescContent + rowId);
				myVerticalSlide.addEvent('complete', function() {
					$("tableDescRow_" + rowId).toggleClass("hidden");
				});
				myVerticalSlide.slideOut();
			} else {
				$("tableDescRow_" + rowId).toggleClass("hidden");
			}
		}
		
		$("tableRow_" + rowId).toggleClass("active");
		
		// change description indicator on and off
		if (this.options.rowExpand) {
			$("descIndicator_" + rowId).toggleClass("tableDescClosed");
			$("descIndicator_" + rowId).toggleClass("tableDescOpened");
		}
		
		if ($("tableRow_" + rowId).hasClass('active')) {
			this.addHash('grid', rowId);
			this.fireEvent('descriptionOpen', this.getDescriptionParams(rowId));
		} else {
			this.removeHash('grid', rowId);
			this.fireEvent('descriptionClose', this.getDescriptionParams(rowId));
		}
		
		this.reloadZebra();
	},
	
	getDescriptionParams: function(rowId) {
		return {id: rowId, rowId: 'descItemTr_' + rowId, data: this.getRowData(rowId), row: $("tableRow_" + rowId)};
	},
	
	isDescriptionOpen: function(rowId) {
		if ($('tableDescRow_' + rowId) && ! $('tableDescRow_' + rowId).hasClass('hidden')) {
			return true;
		}
		return false;
	},
	
	getRowsData: function() {
		return this.data;
	},
	
	getSelectedRows: function() {
		return Object.subset(this.data, this.checkedList);
	},
	
	isChecked: function(rowId) {
		var checkbox = $('tableRow_' + rowId).getElement('input[type="checkbox"]');
		return checkbox.checked;
	},
	
	removeCheckbox: function(rowId) {
		var checkbox = $('tableRow_' + rowId).getElement('input[type="checkbox"]');
		if (checkbox) {
			checkbox.dispose();
		}
	},
	
	disableCheckbox: function(rowId) {
		var checkbox = $('tableRow_' + rowId).getElement('input[type="checkbox"]');
		if (checkbox) {
			checkbox.set('disabled', true);
		}
	},
	
	enableCheckbox: function(rowId) {
		var checkbox = $('tableRow_' + rowId).getElement('input[type="checkbox"]');
		if (checkbox) {
			checkbox.set('disabled', false);
		}
	},
	
	getParams: function() {
		var params = new Object();
		params.limit = this.options.limit;
		params.page = this.page;
		
		if (this.page >= 1) {
			params.offset = (this.page - 1) * this.options.limit;
		}
		
		if (this.order) {
			params.order = this.order;
			params.direction = this.options.direction.toUpperCase();
		}
		
		if (this.appId) {
			params.filters = new Object();
			params.filters.appId = new Array();
			params.filters.appId.push(this.appId);
		}
		
		return params;
	},
	
	///////////  INTERNAL METHODS /////////////
	_updateTotalRows: function(diffRows) {
		if (diffRows) {
			this.totalRows += diffRows;
		}
		
		if ($(this.options.totalContainer)) {
			var totalElement = $(this.options.totalContainer).getElement('.zgrid-total');
			if (totalElement) {
				var displayNow = 0;
				if (typeof pager !== 'undefined') {
					displayNow = pager.itemsPerPage * (this.page - 1);
					var itemsDisplayed = displayNow + Object.getLength(this.data);
					// not increase the from counter when we have empty list
					if (this.totalRows == 0) {						
						totalElement.set('html', this.options.totalLabel + ' ' + displayNow + '-' + itemsDisplayed + ' / ' + this.totalRows);
					} else {						
						totalElement.set('html', this.options.totalLabel + ' ' + (displayNow + 1) + '-' + itemsDisplayed + ' / ' + this.totalRows);
					}
				} else {
					totalElement.set('html', this.options.totalLabel + this.totalRows);
				}
			} else {
				var element = new Element('div', {'class': 'zgrid-total'});
				element.set('html', 'Total: ' + this.totalRows);
				element.inject($(this.options.totalContainer), 'top');
			}
		}
	},
	
	reloadZebra: function() {
		var counter = 0;
		$$('#' + this.tableBody.get('id') + ' tr[id^="tableRow_"]').each(function(row) {
			if (row.isVisible()) {
				row.removeClass('odd');
				row.removeClass('even');
				if (counter % 2 == 0) {
					row.addClass("even");
				} else {
					row.addClass("odd");
				}
				counter++;
			}
		});
	},
	
	/**
	 * Create column that gets her data from callback specefied by id
	 * @param tableRow
	 */
	createNoDataRow: function() {
		
		var tableRow = this.createTableRow(this.tableBody);
		
		var columnsCount = this.columnsOrder.length + 1; // plus 1 to actions column
		if (this.options.multiSelect) {
			columnsCount++;
		}
		
		this.noData = true;
		var tableColumn = new Element('td');
		tableColumn.set('html', _t('No results were found.'));
		tableColumn.set('colspan', columnsCount);
		tableRow.addClass("odd");
		
		tableColumn.inject(tableRow);
		
		this.fireEvent('gridEmpty', {});
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
				this.options.direction = direction;
			} else {
				this.options.direction = 'asc';
			}
		}
		
		var sortImage = new Element('span', {'class': 'direction-' + this.options.direction});
		sortImage.inject(column);
		if (reload) {
			this.page = 1;
			this.fireEvent('loadData', Object.append(this.getParams(), {sort: true}));
		}
	},
	
	toggleSortDirection: function() {
		if (this.options.direction == 'asc') {
			this.options.direction = 'desc';
		} else {
			this.options.direction = 'asc';
		}
	},
	
	/**
	 * Reset the table body
	 */
	reset: function() {
		if (Object.keys(this.data).length != 0) {
			this.preLoad();
		}
		if(this.tableHead.getElement('input[type="checkbox"]')) {
			this.tableHead.getElement('input[type="checkbox"]').set('checked', false);
		}
		this.tableBody.set('html', '');
		this.data = new Object();
		this.checkedList = [];
		this.noData = false;
		
		this.totalRows = 0;
		this._updateTotalRows();
	},
	
	loadData: function () {
		this.fireEvent('loadData', this.getParams());
	},
	
	loadUpdateData: function () {
		this.fireEvent('loadData', this.getParams());
	},
	
	setNewRow: function(rowData, type, nearId, rowExpand) {
		rowExpand = (typeof rowExpand == 'undefined') ? this.options.rowExpand : rowExpand;
		
		var rowId = this.getRowId(rowData);
		
		// create new table row
		var tableRow = this.createTableRow(this.tableBody, {}, type, nearId);
		tableRow.setAttribute('id', "tableRow_" + rowId);
		
		if (this.options.multiSelect) {
			var checkColumn = this.createTableColumn('td', tableRow, '', {width: '13px', height: '22px'});
			var checkboxElement = new Element('input', {type: 'checkbox', 'class': 'zgrid-checkbox', value: rowId});
			checkboxElement.inject(checkColumn);
			
			checkboxElement.addEvent('click', function(event) {
				var checkboxValue = checkboxElement.get('value');

				// checkbox wasn't checked
				if (! checkboxElement.get('checked')) {
					if (! checkboxElement.get('disabled')) {
						if (this.checkedList.contains(checkboxValue)) {
							this.checkedList.erase(checkboxValue);
							//delete this.checkedList[checkboxValue];
						}
						$$('thead input[type="checkbox"]').pick().set('checked', false); // unmark header checkbox
					}
				} else { // checkbox was checked - need to see if all checkboxes are checked
					//this.checkedList[checkboxValue] = rowData;
					this.checkedList.push(checkboxValue);
					
					var allChecked = $$('tbody tr[id^="tableRow"] input[type="checkbox"]').every(function(item) {
						if (item.get('disabled')) {
							return true;
						}
						
						return item.get('checked');
					});
					
					if (allChecked) {
						$$('thead input[type="checkbox"]').pick().set('checked', true);
					}
				}
				
				this.fireEvent('rowChecked', {rowId: rowId, data: rowData, checked: checkboxElement.get('checked')});
			}.bind(this));
		}
		
		
		//var documentWidth = $(document.body).getSize().x;
		var documentWidth = this.container.getSize().x - this.actionsWidth - this.staticWidth;
		
		this.columnsOrder.each(function(rowExpand, columnIndex) {
			if (this.columnModel[columnIndex].width.contains('px')) {
				var columnWidth = this.columnModel[columnIndex].width.toInt() - 10;
			} else {					
				var columnWidth = Math.floor(this.columnModel[columnIndex].width.toInt() * documentWidth / 100) - 10;
			}
			var rowColumn = this.createTableColumn('td', tableRow, '', {width: columnWidth}, {'class': 'zgrid_td zgrid_td-' + this.columnModel[columnIndex].dataIndex});
			rowColumn.set('originalWidth', this.columnModel[columnIndex].width);
			
			// if value exists in row and column have description
			if (rowData[columnIndex] != undefined && this.columnModel[columnIndex]) {
				var columnData = this.columnModel[columnIndex].parser(rowData[columnIndex], rowData);
				columnData = this.ellipsisData(this.columnModel[columnIndex].ellipsis, columnData);
				rowColumn.set('html', columnData);
			}
			
			if (rowExpand) {
				rowColumn.addEvent('click', function(e) {
					if (e.target.hasClass('zgrid-clickable') || e.target.nodeName == "TD" || (e.target.nodeName == "DIV" && e.target.hasClass('zgrid_ellipsis'))) { // catch only click on td
						this.expandRow(rowId, rowData);
					}}.bind(this)
				);
			}
		}.bind(this, rowExpand));

		// create actions column
		var actionsColumn = this.createTableColumn('td', tableRow, '');
		actionsColumn.addClass('no-padding');
		
		actionsColumn.setStyle('display', 'inline-block');
		actionsColumn.setStyle('width', this.actionsWidth);
		
		// create description row if needed
		if (rowExpand) {
			var descIndicator = new Element('span', {'id': 'descIndicator_' + rowId, 'class': 'tableDescClosed tableDescIndicator'});
			descIndicator.inject(actionsColumn);

			descIndicator.addEvent('click', function() {
				this.expandRow(rowId, rowData);
			}.bind(this));
			
			if (this.options.description) {
				this.addDescriptionRow(tableRow, rowId);
			}
		}
		
		if ((this.tableBody.childElementCount / 2) % 2 == 0) {
			tableRow.toggleClass("odd");
		} else {
			tableRow.toggleClass("even");
		}
		
		tableRow.addEvent('mouseenter', function() {
			this.activateRow(rowId);
			this.fireEvent('rowEnter', {'rowId': rowId});
		}.bind(this));
		
		tableRow.addEvent('mouseleave', function() {
			if (! $('tableRow_' + rowId).hasClass('active')) {
				this.deactivateRow(rowId);
				this.fireEvent('rowLeave', {'rowId': rowId});
			}
		}.bind(this));
		
		// add buttons
		this.buttons.each(function(item) {
			var dataIndex = item.dataIndex;
			if ((! item.display) || (item.display(rowData))) {
				var button = new Element('span', {'class' : 'zgrid_btn_off zgrid_btn ' + dataIndex, id: dataIndex + '_' + rowId});
				button.set('title', item.title);
				button.inject(actionsColumn);
				
				button.addEvent('click', function() {
					this.fireEvent('buttonClick', {'rowId': rowId, 'type': dataIndex, 'data': rowData});				
				}.bind(this));
			}
		}.bind(this));
		
		// add menu
		if (this.options.menu != null) {
			this.options.menu.createMenu(actionsColumn, rowId);
		}
		
		this.fireEvent('newRowCreated', {id: rowId, data: rowData});
		
		return tableRow;
	},
	
	updateRow: function(rowData) {
		var rowId = this.getRowId(rowData);
		var rowElements = $('tableRow_' + rowId).getElements('td');
		
		Object.each(rowData, function(column, key) {
			// check if this column is used in the columnModel 
			if (this.columnModel[key]) {
				var columnData = this.columnModel[key].parser(column, rowData);
				columnData = this.ellipsisData(this.columnModel[key].ellipsis, columnData);
				var columnIndex = this.columnsOrder.indexOf(key);
				if (this.options.multiSelect) {
					columnIndex++;
				}
				if (rowElements[columnIndex].get('html') != columnData) {					
					rowElements[columnIndex].set('html', columnData);
				}
			}
		}.bind(this));
	},
	
	addDescriptionRow: function(tableRow, rowId) {
		// add description row
		var tableDescRow = this.createTableRow(this.tableBody, {}, 'after', rowId);
		tableDescRow.setAttribute('id', "tableDescRow_" + rowId);
		tableDescRow.addClass("tableDescRow");
		tableDescRow.addClass("hidden");
		
		
		// add description column
		var descCol = this.createTableColumn('td', tableDescRow, '', {});
		
		descCol.setAttribute('colSpan', $(this.container.get('id') + '_tableHead').getElements('th').length);
		descCol.set('id', 'descItemTr_' + rowId);
		
		// add desctiption column wrapper div
		var descDiv = new Element('div', {'id': this.options.tableDescContent + rowId});
		descDiv.inject(descCol);
	},
	
	activateRow: function(id) {
		if (this.options.menu != null) {
			this.options.menu.showMenu(id);
		}
		
		if ($('tableDescRow_' + id)) {
			$('tableDescRow_' + id).addClass('tableDescRowOver');
		}
		$$('#tableRow_' + id + ' .zgrid_btn').removeClass('zgrid_btn_off');
	},
	
	deactivateRow: function(id) {
		if (this.options.menu != null) {
			this.options.menu.hideMenu(id);
		}
		
		if ($('tableDescRow_' + id)) {
			$('tableDescRow_' + id).removeClass('tableDescRowOver');
		}
		
		$$('#tableRow_' + id + ' .zgrid_btn').addClass('zgrid_btn_off');
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
		return id.replace(/:/g,'_colon_').replace(/\./g,'_dot_').replace(/ /g, '--').replace(/\+/g, '-pp-');
	},
	
	/**
	 * 
	 * @param parent
	 * @param styles
	 * @param type indicates position for the new row relative to an existing one (after or before)
	 * @param nearId
	 * @returns {Element}
	 */
	createTableRow: function(parent, styles, type, nearId) {
		var tableRow = new Element('tr');
		tableRow.setStyles(styles);
		
		if (type) {
			// inject according to other row, only if exists
			if (nearId && $('tableRow_' + nearId)) {
				if (type == 'before') {
					tableRow.inject($('tableRow_' + nearId), type);
				} else if (type == 'after' && $('tableDescRow_' + nearId)) {
					tableRow.inject($('tableDescRow_' + nearId), type);
				} else if (type == 'after' && $('tableRow_' + nearId)) {
					tableRow.inject($('tableRow_' + nearId), type);
				}
			} else {
				tableRow.inject(parent, type);
			}
		} else {
			tableRow.inject(parent);
		}
		
		return tableRow;
	},
	
	createTableColumn: function(type, parent, html, styles, properties) {
		var tableColumn = new Element(type);
		tableColumn.set('html', html);
		tableColumn.set('id', html);
		tableColumn.setStyles(styles);
		if (properties) {
			tableColumn.setProperties(properties);
		}
		
		tableColumn.inject(parent);
		return tableColumn;
	},
	
	getHash: function(name) {
		return this.fragment.getFragmentArray(name);
	},
	
	addHash: function(name, hash) {
		this.fragment.addToUriFragment(name, hash);
	},
	
	setHash: function(name, hash) {
		this.fragment.setUriFragment(name, hash);
	},
	
	removeHash: function(name, hash) {
		this.fragment.deleteFromUriFragment(name, hash);
	},
	
	ellipsisData: function(ellipsis, data) {
		if (ellipsis !== undefined && ellipsis === false) {
			return data;
		}
		
		return '<div class="zgrid_ellipsis" title="' + data.stripTags() + '">' + data + '</div>';
	},
	
	///////////  PROTOTYPES /////////////
	
	html: function(value) {
		return value;
	},
	
	empty: function(value) {
		return '';
	},
	string: function(value) {
		var tableColumn = new Element('div');
		tableColumn.set('text', value);
		
		return tableColumn.get('html');
	},
	
	button: function(value) {
		// do nothing
	},
	
	date: function(value) {
		if (value) {
			return formatDate(dateFromISO8601(value));
		} else {
			return '';
		}
	},
	
	timestamp: function(value) {
		if (value) {
			return formatDate(value);
		} else {
			return '';
		}
	},
	
	boolean: function(value) {
		if (typeof(value) == 'string') {
			value = value.toInt();
		}
		return value ? _t('Yes') : _t('No');
	}
	
});