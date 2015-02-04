var zPager = new Class({
	Implements: [Events],
	
	page: 1,
	totalItems: 50,
	itemsPerPage: 10,
	size: 10,
	lastPage: 1,
	enabled: true,
	
	initialize: function(container, perPage){
		this.container = $(container);
		
		if (!this.container)
			return;
		
		this.itemsPerPage = perPage;
		
		this.listContainer = new Element('div', {id: 'pagination', 'class': 'pagination'});
		this.listContainer.inject(container);
		
		this.list = new Element('ul');
		this.list.inject(this.listContainer);
		
		spacer = new Element('div', {'class': 'clear'});
		spacer.inject(container);
	},
	
	reloadData: function(page, totalItems) {
		this.page = page;
		this.totalItems = totalItems;
		
		this.draw();
	},
	
	setPage: function(page) {
		this.page = page;
	},
	
	setTotalItems: function(totalItems) {
		this.totalItems = totalItems;
	},
	
	reset: function() {
		this.list.set('html', '');
	},
	
	draw: function() {
		var parent = this;
		
		this.reset();
		
		var maxItems = Math.ceil(this.totalItems / this.itemsPerPage);
		// in case of single page - dont show pager
		if (isNaN(maxItems) ||  maxItems == 1) {
			return;
		}
		
		// create prev button
		if (maxItems > 1) {
			var prevBtn = new Element('li', {'class': 'prev'});
			prevBtn.inject(parent.list);
			
			var prevLink = new Element('a', {'href': 'javascript:void(0)', html: '&larr; ' + _t('Previous')});
			prevLink.setStyle('width', '68px');
			prevLink.inject(prevBtn);
			
			if (this.page == 1) {
				prevBtn.addClass('disabled');
			} else {
				prevLink.addEvent('click', function() {
					if (this.enabled) {
						parent.fireEvent('pageSelect', {page: this.page - 1});
					}
				}.bind(this));
			}
		}
		
		var startFrom;
		var endAt;
		if (this.page <= (this.size / 2)) {
			startFrom = 1;
			endAt = this.size;
		} else if (this.page >= (maxItems - (this.size / 2))) {
			startFrom = Math.floor(Math.max(1, maxItems - this.size));
			endAt = maxItems;
		} else {
			startFrom = Math.floor(Math.max(1, this.page - (this.size / 2) + 1));
			endAt = Math.ceil(Math.min(maxItems - 1, this.page + (this.size / 2)));
		}
		
		if (maxItems < this.size) {
			endAt = maxItems;
		}
		
		var lastPage = Math.ceil(this.totalItems / this.itemsPerPage);
		this.lastPage = lastPage;
		
		// add ...
		if (endAt > this.size) {
			// ... button
			var dots = new Element('li');
			dots.inject(parent.list);
			href = new Element('a', {href: 'javascript:void(0)', html: '1 &hellip;'});
			href.addEvent('click',function(event) {
				if (this.enabled) {
					parent.fireEvent('pageSelect', {page: parseInt(event.target.get('text'))});
				}
			}.bind(this));
			href.inject(dots);
			
			startFrom += 2;
		}
		
		if (endAt < lastPage) {
			endAt -= 1;
		}
		
		
		for (i = startFrom; i <=  endAt; i++) {
			listItem = new Element('li');
			
			if (i == this.page) {
				listItem.addClass('active');
			}
			
			listItem.inject(parent.list);
			
			href = new Element('a', {href: 'javascript:void(0)', html: i});
			href.addEvent('click',function(event) {
				if (this.enabled) {
					parent.fireEvent('pageSelect', {page: Number.from(event.target.get('text'))});
				}
			}.bind(this));
			href.inject(listItem);
		}
		
		// add ...
		if (endAt < lastPage) {
			var dots = new Element('li');
			dots.inject(parent.list);
			href = new Element('a', {href: 'javascript:void(0)', html: '&hellip; ' + lastPage});
			href.addEvent('click',function(event) {
				if (this.enabled) {
					parent.fireEvent('pageSelect', {page: lastPage});
				}
			}.bind(this));
			href.inject(dots);
			
			
		}
		
		// create next button
		if (maxItems > 1) {			
			var nextBtn = new Element('li', {'class': 'next'});
			nextBtn.inject(parent.list);			

			var nextLink = new Element('a', {'href': 'javascript:void(0)', html: _t('Next') + ' &rarr;'});
			nextLink.setStyle('width', '45px');
			nextLink.inject(nextBtn);
			
			if (this.page == lastPage) {
				nextBtn.addClass('disabled');
			} else {
				nextLink.addEvent('click', function() {
					if (this.enabled) {
						parent.fireEvent('pageSelect', {page: Number.from(this.page) + 1});
					}
				}.bind(this));
			}
		}

		// set real size of pager so it could be aligned to center
		var totalSize = 0;
		$$('#pagination li a').each(function(item){
			totalSize = totalSize + item.getDimensions().x;
		});
		
		this.container.setStyle('width', (totalSize + 6) + 'px');
		this.fireEvent('draw',{'page': this.page, 'lastPage': this.lastPage, 'totalItems': this.totalItems});
	},
	
	isLastPage: function() {
		return (this.page == this.lastPage); 
	},
	
	enable: function() {
		this.enabled = true;
	},
	
	disable: function() {
		this.enabled = false;
	}
});