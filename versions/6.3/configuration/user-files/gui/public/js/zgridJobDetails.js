var zgridJobDetails = new Class({
	Implements: [Events,Options],
	
	prefix: '',
	
	getOptions: function(){
		return {
			url: null,
			maxServers: 3
		};
	},
	
	initialize: function(options){
		this.setOptions(this.getOptions(), options);
	},
	
	onLoadData: function (data, response)
	{
		if (response) {
			$(data.rowId).set('html', response);
            
			var tabPane = new TabPane('tableDescContent_' + data.id, {}, function() {
                return 0;
			});
			
			var myVerticalSlide = new Fx.Slide('tableDescContent_' + data.id, {resetHeight: true});
			myVerticalSlide.hide();
			myVerticalSlide.slideIn();
			myVerticalSlide.addEvent('complete', function(){
				window.fireEvent('resize');
			});
			
		}
	},
	
	loadData: function(data)
	{
		if (!this.options.url)
			return;
		
		this.prefix = data.prefix;

		var params = {
			id: data.id
		};
		
		var request = new Request({url: this.options.url, data:params, headers: {}});

		request.addEvent("complete", this.onLoadData.bind(this, data) ) ;

		request.get();
	}, 
	
	_createObjectTree: function(obj) {
		var output = '';
		Object.keys(obj).each(function(item) {
			if (typeof obj[item] === "object") {
				console.log(item + ' is object');
				output += item + ': [' + this._createObjectTree(obj[item]) + ']';
			} else {
				output += item + ': ' + obj[item] +'; ';
			}			
		}.bind(this));
		return output;
	}
});