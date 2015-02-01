var filter = new Class({
	Implements: [Events],
	
	internalFilters: {},
	externalFilters: {},
	existingFilters: {},
	selectedFilters: {},
	type: '',
	
	_defaultFilter: '',
	_currentFilter: '',
	_selectSavedFilter: null,
	_filterNameInput: null,
	_dateShadeLabel: null,
	_filterChanged: false,
	_uniqueFilters: {},
	_uniqueFiltersTypes: [],
	_fragmentManager: null,
	_dateFormat: "%d/%b/%Y %k:%M",
	initialize: function(container, internalFilters, externalFilters, existingFilters, type, uniqueFilterTypes, defaultFilterId){
		this.container = $(container);
		this.internalFilters = internalFilters;
		this.externalFilters = externalFilters;
		this.existingFilters = existingFilters;
		this._defaultFilter = defaultFilterId;
		this.type = type;
		
		this._fragmentManager = new FragmentManager();
		var fragment = this._fragmentManager.getFragmentObject();
		
		this.showFilterBar($(container), type, fragment);
		uniqueFilterTypes.each(function(item) {
			this._addUniqueFilterType(item);	
		}.bind(this));
		
		var divContent = new Element('div', { id: 'filter_details_content', 'class': 'filter_details_content'});
		divContent.inject($(container));
		var table = new Element('table');
		Object.each(internalFilters, function(filterData) {
			var tr = new Element('tr');
			this.addInternalFilterRow(tr, filterData);
			tr.inject(table);
		}.bind(this));
		
		var tr = new Element('tr');
		
		// create label and content td containers
		labelTd = new Element('td');
		labelTd.inject(tr);
		contentTd = new Element('td');
		contentTd.inject(tr);
		
		var div = new Element('div', {
			'html': _t('Search'),
			'class': 'filterLabel'
		});
		div.inject(labelTd);
		
		var innerSearch = new Element('div', {'class': 'searchField', 'id': 'inner-search', 'placeholder': _t('Search...')});
		innerSearch.inject(contentTd);
				
		tr.inject(table);
		
		table.inject(divContent);
		this.toggleFilterDetails(false);
		
		this.showSelectedFilterRow($(container));
		this._currentFilter = this._fragmentManager.getFragmentValue('filterId');
		
		if (this._currentFilter && this.existingFilters[this._currentFilter]) {
			
			var index = this.findSelectOptionIndexByName(this._currentFilter);
			
			// we have a filterId, clean out the extra filters
			Object.each(fragment, function(filterData, filterIndex){
				if (this.internalFilters[filterIndex]) {
					this._fragmentManager.removeUriFragment(filterIndex);
				}
			}.bind(this));
			
			
			this._selectSavedFilter.selectedIndex = index != null ? index : this._selectSavedFilter.selectedIndex;
			this._selectSavedFilter.fireEvent('change', {});
			this.selectFilterSet();
			
			this.loadFilterData();
		} else if (Object.some(fragment, function(item, key) {
			return typeof this[key] != 'undefined';
			}.bind(this.internalFilters))) {
		
			Object.each(fragment, function(filterData, filterIndex){
				if (this.internalFilters[filterIndex]) {
					filterData.each(function(name, index){
						if (name && this.internalFilters[filterIndex].options[name]) {
							this.selectFilter($(name), filterIndex, name, this.internalFilters[filterIndex].options[name]);
							this.addToFiltering(filterIndex, name);
						}
					}.bind(this));
				}
			}.bind(this));
		
			this.filterChanged();
			this._currentFilter = this._defaultFilter;
		} else {
			this._currentFilter = this._defaultFilter;
			this.setSelectOptionByName(this._defaultFilter);
			this.selectFilterSet();
			this.filterControls();
		}
		
		this.addTips();
		this._filterNameInput = $('filter_name_input');
		
		var searchField = new SearchField();
		searchField.addEvent('searchClicked', function(data, element) {
			var value = data['value'];
			var elem = data['element'];
			
			// outer search
			if (elem.get('id') == 'outer-search_input') {
				if (value) {
					if (isNaN(value)) {
						this.selectSearchFilter(value, 'freeText', 'search', 'freeText');
						this.addToSearchFiltering('freeText', value);
						this.filterChanged();
						this.runFiltering();
					} else {
						this.addToSearchFiltering('freeText', value);
						this.fireEvent('loadItemDetails', {query: value});
					}
				} else {
					if ($('search')) {
						$('search').dispose();
					}
					$$('input.search')[1].value = '';
					this.removeFromSearchFiltering('freeText');
					this.filterChanged();
					this.runFiltering();
				}
			} else {
				if (value) {
					this.selectSearchFilter(value, 'freeText', 'search', 'freeText');
					this.addToSearchFiltering('freeText', value);
					this.filterChanged(filter);
					this.runFiltering();
				} else {
					if ($('search')) {
						$('search').dispose();
					}
					$$('input.search')[1].value = '';
					this.removeFromSearchFiltering('freeText');
					this.filterChanged();
					this.runFiltering();
				}
			}
		}.bind(this));
	},
	setSelectOptionByName: function(name) {
		try {
			var index = this.findSelectOptionIndexByName(name);
			this._selectSavedFilter.selectedIndex = index;
		} catch (Error) {
			this._selectSavedFilter.selectedIndex = this._selectSavedFilter.selectedIndex;
		}
	},
	findSelectOptionIndexByName: function(name) {
		for(var i in this._selectSavedFilter.options) {
			if (this._selectSavedFilter.options[i].value == name) {
				return i;
			}
		}
		throw Error('Predefined filter not found');
	},
	currentFilter: function() {
		return this._currentFilter;
	},
	isDefaultFilterLoaded: function() {
		return this._currentFilter == this._defaultFilter;
	},
	
	selectFilterSet: function() {
		this._currentFilter = this._selectSavedFilter.value;
		this._fragmentManager.setUriFragment('filterId', this._currentFilter);
	},
	
	addTips: function() {
	    var saveTip = new FloatingTips('.saveas_filter_btn', {
	    	
			content: function(e) {
			
	    		var result = '<div id="close_filter_name" onclick="closeTip();" style="text-align: right;padding-bottom: 5px;" class="linkable">[x]</div>';
	    		result += '<div><input id="filter_name_input" value="' + (this._currentFilter ? this._currentFilter : '') + '" placeholder="Custom Filter name" type="text" placeholder="' + _t('Filter name...') + '">';
				
	    			
	    		window.closeTip = function() {
	    			saveTip.hide(e);
	    		}.bind(this)
	    		
	    		window.saveTip = function() {
	    			this._filterNameInput = $('filter_name_input');
	    			this._currentFilter = '';
	    			this.saveFilterAction();
	    			saveTip.hide(e);
	    		}.bind(this)

	    		result += '<button onclick="saveTip()">Save</button></div>'
	    		return result;
	    	}.bind(this),
			html: true,
			position: 'bottom', // Bottom positioned
			center: true, // Place the tip aligned with target
			arrowSize: 8, // A bigger arrow!
			showOn: 'click',
			hideOn: 'null',
		});
	    

		//$('close_filter_name').addEvent('click', function() {
			//saveTip.hide(e);
		//}.bind(this));
	},

	showFilterBar: function (parent, type, fragment) {
		var divFilterBar = new Element('div', {id: 'filterBar'});
		divFilterBar.inject(parent);
		
		var divSelectFiltersControls = new Element('div', {'class': 'divSelectFiltersControls'});
		divSelectFiltersControls.inject(divFilterBar);
		
		var aShowFilter = new Element('a', { 	'id': 'show_filter_details',
			'text'  : _t('Show Filters'),
			'href' : 'javascript:void(0)',
			'class' : 'showFilterDetails hidden',
			events: {
				click: function(){
					this.toggleFilterDetails(true);
				}.bind(this)
			}});
		aShowFilter.inject(divSelectFiltersControls);
		
		var aHideFilter = new Element('a', { 	'id': 'hide_filter_details',
			'text'  : _t('Hide Filters'),
			'href' : 'javascript:void(0)',
			'class' : 'hideFilterDetails',
			events: {
				click: function(){
					this.toggleFilterDetails(false);
				}.bind(this)
			}});
		
		aHideFilter.inject(divSelectFiltersControls);
		
		var selectSavedFilter = new Element('select', {'class': type + '-filter-id',
			'id' : type + '-filter-id',
			events: {
				change: function(item) {
					this.selectFilterSet();
					this.loadFilterData();
				}.bind(this)
			}});
		this._selectSavedFilter = selectSavedFilter;

		var option = new Element('option', {
			html: _t('Unsaved Custom Filter'),
			value: 'unsaved',
			class: 'hidden',
			id:	'custom_unsaved_option',
			events: {
				click: function() {
				}
			}
		});
		option.inject(this._selectSavedFilter);
		
		Object.each(this.existingFilters, function(value, index){
			//if (value.id == 1) {
				//this._defaultFilter = index;
			//}
			this.addFilterToPredefined(index, index);
		}.bind(this));
		
		// set the first predefined filter to be selected by default
		this._selectSavedFilter.value = this._defaultFilter;
		if (!this._currentFilter) {
			this.findSelectOptionIndexByName(this._defaultFilter);
		}
		
		selectSavedFilter.inject(divSelectFiltersControls);
		
		var divSelectedFiltersButtons = new Element('div', {'class': 'selectedFiltersButtons'});
		divSelectedFiltersButtons.inject(divFilterBar);
		
		var deleteButton = new Element ('button', {'id': 'delete_filter_btn', 'title' : _t('Delete the selected filter'), 'html' : _t('Delete')});
		deleteButton.addEvent('click', this.deleteFilterAction.bind(this));
		deleteButton.inject(divSelectedFiltersButtons);
		
		var saveasButton = new Element ('button', {'id': 'saveas_filter_btn', 'class':  'saveas_filter_btn', 'title' : _t('Create a new filter based on the current one'), 'html' : _t('Save As...')});
		saveasButton.inject(divSelectedFiltersButtons);
		
		var saveButton = new Element ('button', {'id': 'save_filter_btn', 'title' : _t('Save filter'), 'html' : _t('Save')});
		saveButton.addEvent('click', this.saveFilterAction.bind(this));
		saveButton.inject(divSelectedFiltersButtons);

		new Element('span', {id: 'filter_name_display'}).hide().inject(divSelectedFiltersButtons);
		
		var outerSearch = new Element('div', {'class': 'searchField', 'id': 'outer-search', 'placeholder': _t('Search...')});
		outerSearch.inject(divFilterBar);
		
		var divExternalFiltersContainer = new Element('div', {'class': 'externalFiltersContainer'});
		divExternalFiltersContainer.inject(divFilterBar);
		
		var divExternalFilters = new Element('div', {'class': 'externalFilters'});
		divExternalFilters.inject(divExternalFiltersContainer);
		
		var timeRangeFilter = new Element('div', {'id': 'timeRangeFilter'});
		timeRangeFilter.inject(divExternalFilters);
		
		if (this.externalFilters.length > 0) {
			var timeRangeExternalFilter = this.externalFilters[0];
			var select = this.addTimeRangeSelect(timeRangeExternalFilter, fragment);
			var timeSpan = new Element('span');
			var timeLabel = new Element('label', {html: _t('Time Range'), 'for': 'timeRange'});
			timeLabel.inject(timeSpan);
			select.inject(timeSpan);
			timeSpan.inject(timeRangeFilter);
			
			var timeSpan = new Element('span');
			var timeLabel = new Element('label', {html: _t('From'), 'for': 'filterFrom'});
			var timeInput = new Element('input', {'id': 'filterFrom', 'class': 'datePicker', 'value': formatDate(removeTimezoneOffset((new Date(timeRangeExternalFilter.extra['day'][0]))), this._dateFormat, false)});
			var timeImage = new Element('div', {'class': 'timeRangeCalendarIcon'});
			timeImage.addEvent('click', function(e) {
				e.stopPropagation();
				$('filterFrom').fireEvent('click', {'target': $('filterFrom')});
			});
			
			timeLabel.inject(timeSpan);
			timeInput.inject(timeSpan);
			timeImage.inject(timeSpan);
			timeSpan.inject(timeRangeFilter);
			
			var timeSpan = new Element('span');
			var timeLabel = new Element('label', {html: _t('To'), 'for': 'filterUpto'});
			var timeInput = new Element('input', {'id': 'filterUpto', 'class': 'datePicker', 'value': formatDate(removeTimezoneOffset((new Date(timeRangeExternalFilter.extra['day'][1]))), this._dateFormat, false)});
			var timeImage = new Element('div', {'class': 'timeRangeCalendarIcon'});
			timeImage.addEvent('click', function(e) {
				e.stopPropagation();
				$('filterUpto').fireEvent('click', {'target': $('filterUpto')});	
			});
			
			timeLabel.inject(timeSpan);
			timeInput.inject(timeSpan);
			timeImage.inject(timeSpan);
			timeSpan.inject(timeRangeFilter);
			
			timeRangeFilter.getElements('input').addEvent('change', function(event){
				var fromTimestamp = Date.parse($('filterFrom').value);
				var toTimestamp = Date.parse($('filterUpto').value);
				if (! this.validateTimeRange(timeRangeExternalFilter.allowedRange, fromTimestamp, toTimestamp)) {
					document.fireEvent('toastAlert', {'message': 'Time range not allowed'});
					return ;
				}
				
				if ($$('option[value="custom"]').length == 0) {
					var option = new Element('option', {
					    'title': 'Custom',
					    'value' : 'custom',
					    html: 'Custom'});
					option.inject($('timeRange'));
				}
				$('timeRange').value = 'custom';
				this.selectedFilters.from = Math.floor(fromTimestamp.getTime()/1000);
				// to add 60sec to include in the filters all issues that happened in the last minute
				this.selectedFilters.to = Math.floor(toTimestamp.getTime()/1000) + 60;
				
				this._fragmentManager.setUriFragment('timeRange', 'custom');
				this._fragmentManager.setUriFragment('from', this.selectedFilters.from);
				this._fragmentManager.setUriFragment('to', this.selectedFilters.to);
				
				this.runFiltering();
			}.bind(this));
			
			// check fragment for custom timerange
			if (this._fragmentManager.getFragmentValue('timeRange') == 'custom') {
				var createCustomField = false;
				var from = this._fragmentManager.getFragmentValue('from');
				var to = this._fragmentManager.getFragmentValue('to');
				
				if (from != null && (this.validateTimeRange(timeRangeExternalFilter.allowedRange, new Date(from*1000), new Date()))) {
					createCustomField = true;
					$('filterFrom').value = formatDate(from, this._dateFormat, false);
					this.selectedFilters.from = this.dateStrToTimestamp(from);
				}
				
				if (to != null && (this.validateTimeRange(timeRangeExternalFilter.allowedRange, new Date(), new Date(to*1000)))) {
					createCustomField = true;
					$('filterUpto').value = formatDate(to, this._dateFormat, false);
					this.selectedFilters.to = this.dateStrToTimestamp(to);
				}
				
				if (createCustomField) {
					if ($$('option[value="custom"]').length == 0) {
						var option = new Element('option', {
						    'title': 'Custom',
						    'value' : 'custom',
						    html: 'Custom'});
						option.inject($('timeRange'));
					}
					$('timeRange').value = 'custom';
				}
			}
		}
	},
	validateTimeRange: function(allowedRange, from, to) {
		if (allowedRange) {
			var fromTimestamp = Date.parse(from);
			var toTimestamp = Date.parse(to);
	
			var currentTimestamp = new Date();
			currentTimestamp.setSeconds(0);
			currentTimestamp.setTime(currentTimestamp.getTime()-1000);
			var diffFrom = Math.abs(currentTimestamp - fromTimestamp)/1000;
			var diffTo = Math.abs(currentTimestamp - toTimestamp)/1000;

			var delta = 0;
			switch (allowedRange) {
				case '3months':
					delta = 60 * 60 * 24 * 93;
					break;
				case '2weeks':
					delta = 60 * 60 * 24 * 14;
					break;
				case '2hour':
					delta = 60 * 60 * 2;
					break;
			}

			if (delta != 0 && (diffFrom > delta || diffTo > delta)) {
				return false;
			}
		}
		return true;
	},
	addTimeRangeSelect: function(filterData, fragment) {
		var select = new Element('select', {'class': filterData.name, 'id': filterData.name});
		
		Object.each(filterData.options, function(text, id) {
			var option = new Element('option', {
			    'title': text,
			    'value' : id,
			    html: text});
			option.inject(select);
			if (id == fragment.timeRange) {
				option.set('selected', 'selected');
			}
			
		});
		
		select.addEvent('change', function(item) {
			
			if (item.target.value == 'all') {
				delete this.selectedFilters.from;
				delete this.selectedFilters.to;
				
				this._fragmentManager.removeUriFragment('timeRange');
				this._fragmentManager.removeUriFragment('from');
				this._fragmentManager.removeUriFragment('to');
			} else {
				switch (item.target.value) {
					case '2hours':
						fromDate = new Date();
						fromDate.setHours(fromDate.getHours()-2);
						break;
					case 'day':
						fromDate = new Date();
						fromDate.setDate(fromDate.getDate()-1);
						break;
					case 'week':
						fromDate = new Date();
						fromDate.setDate(fromDate.getDate()-7);
						break;
					case '2weeks':
						fromDate = new Date();
						fromDate.setDate(fromDate.getDate()-14);
						break;
					case 'month':
						fromDate = new Date();
						fromDate.setMonth(fromDate.getMonth()-1);
						break;
					case '3months':
						fromDate = new Date();
						fromDate.setMonth(fromDate.getMonth()-3);
						break;
					case '6months':
						fromDate = new Date();
						fromDate.setMonth(fromDate.getMonth()-6);
						break;
					case 'year':
						fromDate = new Date();
						fromDate.setMonth(fromDate.getMonth()-12);
						break;
				}
				
				toDate = new Date(new Date());

				if (! this.validateTimeRange(filterData.allowedRange, fromDate, toDate)) {
					document.fireEvent('toastAlert', {'message': 'Time range not allowed'});
					return ;
				}
				$('filterFrom').value = formatDate(removeTimezoneOffset(fromDate), this._dateFormat, false);
				$('filterUpto').value = formatDate(removeTimezoneOffset(toDate), this._dateFormat, false);
				
				this.selectedFilters.from = filterData.extra[item.target.value][2];
				this.selectedFilters.to = filterData.extra[item.target.value][3];
				
				this._fragmentManager.setUriFragment('timeRange', item.target.value);
				this._fragmentManager.removeUriFragment('from', item.target.value);
				this._fragmentManager.removeUriFragment('to', item.target.value);
			}
			 $$('option[value="custom"]').dispose();
			this.runFiltering();
			
		}.bind(this));
		
		return select;
	},
	
	removeFilterFromPredefined: function(value) {
		this._selectSavedFilter.options[this._selectSavedFilter.selectedIndex].dispose();
		this._selectSavedFilter.selectedIndex = this.findSelectOptionIndexByName(this._defaultFilter);
		this.selectFilterSet();
		this.loadFilterData();
	},
	
	addFilterToPredefined: function(text, value) {
		var option = new Element('option', {
		    html: text,
		    value: value,
		    events: {
		        click: function() {
		        	
		        }
		    }
		});
		
		option.inject(this._selectSavedFilter);
	},
	
	toggleFilterDetails: function (toOpenDetail) {
 		if (toOpenDetail) {
 			$('show_filter_details').addClass('hidden');
			$('hide_filter_details').removeClass('hidden');
			$('filter_details_content').removeClass('hidden');
			$$('#filterBar .selectedFiltersButtons').show();
 	 	} else {
 	 		$('hide_filter_details').addClass('hidden');
			$('show_filter_details').removeClass('hidden');
			$('filter_details_content').addClass('hidden');
			$$('#filterBar .selectedFiltersButtons').hide();
 	 	}
	},
	
	showSelectedFilterRow: function (parent) {
		
		var divSelectedFiltersBar = new Element('div', {
			'class': 'selectedFiltersBar',
		});
		divSelectedFiltersBar.inject(parent);
		
		var tableSelectedFiltersBox = new Element('table', {
			'class': 'selectedFiltersBox',
			'id': 'selectedFiltersBox'
		});
		tableSelectedFiltersBox.inject(divSelectedFiltersBar);
		
		var divSelectedFiltersBox = new Element('tr');
		divSelectedFiltersBox.inject(tableSelectedFiltersBox);

		// create label and content td containers
		labelTd = new Element('td');
		labelTd.inject(divSelectedFiltersBox);
		contentTd = new Element('td');
		contentTd.inject(divSelectedFiltersBox);
		
		// add an icon to clear all filters and call to the default filter
		var spanClearFilters= new Element('span', {'class' : 'clearFilters', 'title' : _t('Clear filters'),
			events: {
				click: function(){
					this.clearFilters();
					this._fragmentManager.resetFragment();
					this.fireEvent('filtersClear', {});
				}.bind(this)
			}});
		spanClearFilters.inject(labelTd);
		
		var filterLabel = new Element('div', {
			'html': _t('Filter By : '),
			'class': 'selectedFiltersLabel'
		});
		filterLabel.inject(labelTd);
		
		var span = new Element('span', {
			'class' : 'noFiltersSelectedText',
			'id' : 'noFiltersSelectedText',
			'html' : '&nbsp;&nbsp;' + _t('Currently no filter selected')
		});
		span.inject(filterLabel);
		
		var selectedFiltersList = new Element('div', {'class': 'selectedFiltersList', 'id': 'selectedFiltersList'});
		selectedFiltersList.inject(contentTd);
		
	},

	clearFilters: function() {
		this._selectSavedFilter.value = this._defaultFilter;
		this._selectSavedFilter.fireEvent('change');
	},
	
	deleteFilterAction: function() {
		var filterName = this._selectSavedFilter.value;
        
		if(window.confirm(_t('Are you sure you wish to delete "{filterName}"', {filterName: filterName}))) {
			
			this.removeFilterFromPredefined(filterName);
			delete this.existingFilters[filterName];
			this.filterChangedReset();
			this.clearFilters();
			
			new Request.WebAPI({
                url: baseUrl() + '/Api/filterDelete',
                method: 'post',
                onSuccess: function(response) {
                    var filterName = response.responseData.filter.name;
                    this.fireEvent('deleteFilter', {filterName: filterName});
                }.bind(this),
                onFailure: function(response) {
                	var decoded = JSON.decode(response.response);
                	this.fireEvent('deleteFilterFailed', {filterName: filterName, errorData: decoded.errorData});
                }.bind(this)
        	}).send({data:{name: filterName}});
		}
	},
	
	setExistingFilter: function(filterName, filter) {
        this.existingFilters[filterName] = {
        		'id': filter.id,
        		'name': filter.name,
        		'custom': filter.custom,
        		'data': filter.data,
        };
	},
	
	saveFilterAction: function() {

		var existingFilter = this.existingFilters[this._currentFilter];
		var filterId = existingFilter ? existingFilter.id : 0;
		var filterName = (this._filterNameInput) ? this._filterNameInput.value : this._currentFilter;
		new Request.WebAPI({
            url: baseUrl() + '/Api/filterSave',
            method: 'post',
            onSuccess: function(response) {
                var filterName = filterId ? this._currentFilter : this._filterNameInput.value;
                var filter = response.responseData.filter;
                
                if (this._currentFilter) { /// not a new filter
                	if (this._currentFilter != filterName) { /// save as or rename
                		var oldFilterId = this.existingFilters[this._currentFilter].id;
                		if (oldFilterId == filter.id) { // rename
                			// replace the existing filter in select and existingFilters
                			delete this.existingFilters[this._currentFilter];
                			this._selectSavedFilter.options[this._selectSavedFilter.selectedIndex].value = filterName;
                			this._selectSavedFilter.options[this._selectSavedFilter.selectedIndex].set('text', filterName);
                			this._selectSavedFilter.options[this._selectSavedFilter.selectedIndex].set('title', filterName);
                			
                		} else {
                			this.addFilterToPredefined(filterName, filterName);
                			this._selectSavedFilter.selectedIndex = this._selectSavedFilter.length - 1;
                    		
                		}
                	} else {
                		// do nothing
                	}
                } else { // new filter
                	this.addFilterToPredefined(filterName, filterName);
                	this._selectSavedFilter.selectedIndex = this._selectSavedFilter.length - 1;
                }
                this.setExistingFilter(filterName, filter);
                this.filterChangedReset();
                
                this.selectFilterSet();
                this.filterControls();
                this.fireEvent('saveFilter', {
					filterName: filterName,
					selectedFilters: this.selectedFilters
				});
            }.bind(this),
            onFailure: function(response) {
            	var decoded = JSON.decode(response.response);
            	this.fireEvent('saveFilterFailed', {
					selectedFilters: this.selectedFilters,
					errorData: decoded.errorData
				});
            }.bind(this)
    	}).send({data:{data: this.selectedFilters, type: this.type, name: filterName, 'id': filterId}});
		
		
	},
	
	loadFilterData: function () {
		if ((! this._currentFilter) || (! this.existingFilters[this._currentFilter])) {
			return ;
		}
		
		var loadFilter = this.existingFilters[this._currentFilter];
		var data = this.existingFilters[this._currentFilter].data;
		
		Object.each(this.selectedFilters, function(filterData, filterName) {
			if (typeof(filterData) == 'object') {
				var selectedFilters = Array.clone(filterData);
				selectedFilters.each(function (filterId) {
					$(filterId).dispose();
					this.removeSelectedFilter(filterName, filterId, this.internalFilters[filterName].options[filterId]);
					this.removeFromFiltering(filterName, filterId);
				}.bind(this));
			} else if (filterName == 'freeText' && filterData){
				if ($('search')) {
					$('search').dispose();
				}
				$$('input.search')[1].value = '';
				this.removeFromSearchFiltering(filterName);
			}
		}.bind(this));
		
		Object.each(data, function(filterData, filterIndex) {
			if (filterIndex == 'freeText') {
				if ($$('input.search').length > 0) {
					$$('input.search')[1].value = filterData;
					this.selectSearchFilter(filterData, 'freeText', 'search', 'freeText');
					this.addToSearchFiltering('freeText', filterData);
				}
			} else {
				Object.each(filterData, function(name, index) {
					if (this.internalFilters[filterIndex]) {
						this.selectFilter($(name), filterIndex, name, this.internalFilters[filterIndex].options[name]);
						this.addToFiltering(filterIndex, name);
					}
				}.bind(this));
			}
		}.bind(this));
		
		this.runFiltering();
		if(loadFilter.custom.toInt()) {
			//$('filter_name_input').set('value', this._currentFilter);
			$('filter_name_display').set('text', this._currentFilter);
		}
		this.filterChangedReset();
	},

	addInternalFilterRow: function(parent, filterData) {
		// create label and content td containers
		labelTd = new Element('td');
		labelTd.inject(parent);
		contentTd = new Element('td');
		contentTd.inject(parent);
		
		var div = new Element('div', {
			'html': _t(filterData.label),
			'class': 'filterLabel'
		});
		div.inject(labelTd);
		
		var divOptions = new Element('div', {'id': filterData.name, 'class': 'optionsContainer'});
		divOptions.inject(contentTd);
		
		if (Object.getLength(filterData.options) == 0 && filterData.noOptionsError) {
			var span = new Element('span', {
			   'html' : filterData.noOptionsError
			});
			span.inject(divOptions);
		}
		
		Object.each(filterData.options, function(text, id) {
			var div = new Element('div', {
			    'id' : id,
			    'class': 'filterOption',
			    text: text
			});
			div.addEvent('click', function() {
				this.selectFilter(div, filterData.name, id, text);
				this.addToFiltering(filterData.name, id);
				this.filterChanged(filter);
				this.runFiltering();
			}.bind(this));
			
			div.inject(divOptions);
		}.bind(this));
		
	},
	
	displayDateShadeLabel: function() {
		var from = Date.parse(this.selectedFilters.from * 1000);
		var to = Date.parse(this.selectedFilters.to * 1000);
		this._dateShadeLabel.set('text', _t('{from} - {to}',
				{from: formatDate(from), to: formatDate(to)}));
	},
	
	dateStrToTimestamp: function (dateStr) {
		dateStr += '';

		// timestamp only
		if (dateStr.test(/^[0-9]+$/)) {
			var date = new Date(dateStr.toInt() * 1000);
			return date.format('%s');
		} else {
			return Date.parse(dateStr).format('%s');
		}
	},
	
	selectSearchFilter: function(query, filter, filterId, filterName) {
		// if there is a text about no selected filters - remove it first
		this.toggletheNoSlectedFiltersText(true);
		
		var spanFilterName = new Element('span', {'class' : 'selectedFilter ' + filter, 'id' : filterId});
		spanFilterName.appendText(query);
		spanFilterName.appendText(' x');
		spanFilterName.addEvent('click', function(filter,item) {
			// if there is no selected filters in the selected area -  add a msg about no selected filters
			this.toggletheNoSlectedFiltersText(false);
			
			item.target.dispose();
			this.removeFromSearchFiltering(filter);
			this.filterChanged(filter);
			this.runFiltering();
		}.bind(this,filter));

		var divSelectedFiltersList = $$('div.selectedFiltersList').pick();
		// if already exists - replace
		if ($(filterId)) {
			$(filterId).dispose();
		}
		spanFilterName.inject(divSelectedFiltersList);
	},
	
	toggletheNoSlectedFiltersText: function(isEnable) {
		if (isEnable) {
			if ($('noFiltersSelectedText')) {
				$('noFiltersSelectedText').addClass('hidden');
			}
		} else {
			// just one that is going to be removed
			if ($('selectedFiltersList').getElements('.selectedFilter').length == 1) {
				if ($('noFiltersSelectedText')) {
					$('noFiltersSelectedText').removeClass('hidden');
				}				
			}
		}
	},
	
	selectFilter: function(filterOptionElement, filter, filterId, filterName) {
		
		// if there is a text about no selected filters - remove it first
		this.toggletheNoSlectedFiltersText(true);
		
		var spanFilterName = new Element('span', {'class' : 'selectedFilter ' + filter, 'id' : filterId});
		spanFilterName.appendText(filterName);
		spanFilterName.appendText(' x');
		spanFilterName.addEvent('click', function(item) {
			// if there is no selected filters in the selected area -  add a msg about no selected filters
			this.toggletheNoSlectedFiltersText(false);
			
			spanFilterName.dispose();
			this.removeSelectedFilter(filter, filterId, filterName);
			this.removeFromFiltering(filter, filterId);
			this.filterChanged(filter);
			this.runFiltering();
		}.bind(this));
		
		divSelectedFiltersList = $$('div.selectedFiltersList').pick();
		spanFilterName.inject(divSelectedFiltersList);
		
		// check if the filter has options, in case of no options to show the default message 
		if (filterOptionElement.parentElement.children.length == 1) {
			var span = new Element('span', {
				'class' : 'noFiltersOptions',
			   'html' : _t('No more choices available')
			});
			span.inject(filterOptionElement.parentElement);
		}
			
		if (filterOptionElement) {			
			filterOptionElement.dispose();
		}
		
		if (this._isUniqueType(filter)) {
			this._removeUniqueFilter(filter);
			this._uniqueFilters[filter] = filterId;
		}
		
	},
	isCustomFilter: function(filterName) {
		if (this.existingFilters[filterName]) {
			return this.existingFilters[filterName].custom.toInt() == 1;
		}
		return false;
	},
	filterChanged: function(filterName) {
		this._filterChanged = true;

		// this is a predefined filter it cannot be overwritten/updated
		if (! this.isCustomFilter(this.currentFilter())) {
			var option = $('custom_unsaved_option');
			option.show();
			this._selectSavedFilter.selectedIndex = 0;
			this._currentFilter = null;
			this._fragmentManager.removeUriFragment('filterId');
		}
		
		this.filterControls();
	},
	
	isFilterChanged: function() {
		return this._filterChanged;
	},
	
	filterChangedReset: function() {
		$('custom_unsaved_option').hide();
		$('saveas_filter_btn').set('disabled', false);
		this._filterChanged = false;
		this.filterControls();
	},
	
	filterControls: function() {
		// selected custom filter
		if (this._currentFilter && this.existingFilters[this._currentFilter].custom.toInt() == 1) {
			$('delete_filter_btn').set('disabled', false);
			$('saveas_filter_btn').set('disabled', false);
			$('save_filter_btn').set('disabled', true);
		} else {
			// it's a predefined filter
			$('delete_filter_btn').set('disabled', true);
			$('saveas_filter_btn').set('disabled', false);
			$('save_filter_btn').set('disabled', true);
		}

		/// see if there are any meaningful filters out there (that have sub-clauses and are not external)
		var filteredFiltersCount = Object.getLength(Object.filter(this.selectedFilters, function(item, key) {
			if (key == 'to' || key == 'from') {
				return false;
			}
			return item.length > 0;
		}));
		
		if(this.isFilterChanged() && filteredFiltersCount > 0 && !$('custom_unsaved_option').selected) {
			$('save_filter_btn').set('disabled', false);
		} else if(this._filterNameInput && this._filterNameInput.value != '' && filteredFiltersCount > 0) {
			$('save_filter_btn').set('disabled', true);
		} else {
			$('save_filter_btn').set('disabled', true);
			$('saveas_filter_btn').set('disabled', false);
		}
	},
	
	addToFiltering: function (filterName, filterId) {
		// set the choosen filter in the global variable to run filtering
		if (! this.selectedFilters[filterName]) {
			this.selectedFilters[filterName] = [];
		}
		
		if (this._isUniqueType(filterName)) {
			// replace the existing
			this.selectedFilters[filterName] = [filterId];
			this._fragmentManager.setUriFragment(filterName, filterId);
			this.fireEvent('filterPartCleared', {filterType: filterName});
		} else {			
			this._fragmentManager.addToUriFragment(filterName, filterId);
			this.selectedFilters[filterName].push(filterId);
		}
		this.fireEvent('filterPartAdded', {filterType: filterName, filterPartName: filterId});
	},
	
	addToSearchFiltering: function (filterName, filterId) {
		this.selectedFilters[filterName] = filterId;
		this._fragmentManager.setUriFragment(filterName, filterId);
		this.fireEvent('filterPartAdded', {filterType: filterName, filterPartName: filterId});
	},
	
	removeFromSearchFiltering: function(filterName) {
		this.selectedFilters[filterName] = '';
		this._fragmentManager.removeUriFragment(filterName);
		this.fireEvent('filterPartCleared', {filterType: filterName});
	},
	
	removeFromFiltering: function(filter, filterId) {
		// remove the filter from the global variable
		this.selectedFilters[filter].erase(filterId);
		this._fragmentManager.deleteFromUriFragment(filter, filterId);
		this.fireEvent('filterPartRemoved', {filterType: filter, filterPartName: filterId});
	},
	
	runFiltering: function() {
		this.fireEvent('runFiltering', this.selectedFilters);
	}, 
	
	removeSelectedFilter: function(filter, filterId, filterName) {

		// rollback the selection of filter option
		var div = new Element('div', {
		    'title': filterName,
		    'id' : filterId,
		    'class': 'filterOption',
		    text: filterName
		});
		
		div.addEvent('click', function(item) {
			this.selectFilter(div, filter, filterId, filterName);
			this.addToFiltering(filter, filterId);
			this.filterChanged(filter);
			this.runFiltering();
		}.bind(this));
		
		if ($(filter).getElement('span.noFiltersOptions')) {
			$(filter).getElement('span.noFiltersOptions').dispose();
		}
		div.inject($(filter), 'top');

		if (this._isUniqueType(filter)) {
			delete this._uniqueFilters[filter];
		}
	},
	
	_addUniqueFilterType: function(filterType) {
		this._uniqueFiltersTypes.push(filterType);
	},
	
	_isUniqueType: function(type) {
		return this._uniqueFiltersTypes.contains(type);
	},
	
	_removeUniqueFilter: function(type) {
		if (this._uniqueFilters[type] != undefined) {
			var elem = $(this._uniqueFilters[type]);
			var elemFilterName = elem.get('text').replace(' x', '');
			elem.dispose();
			this.removeSelectedFilter(type, this._uniqueFilters[type], elemFilterName);
		}
	}
});