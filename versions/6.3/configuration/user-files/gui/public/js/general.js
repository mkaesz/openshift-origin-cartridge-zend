function dateFromISO8601(isostr) {
	var parts = isostr.match(/\d+/g);
	
	var utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
	var offsetDate = utcDate.getTime() + utcDate.getTimezoneOffset() * 60000;
	
	return new Date(offsetDate);
}

function _t(str, params) {		
	return str.substitute(params);
}

function formatFileSize(size, order) {
	var sizes = [{'mul': 30, 'order': 'gb'}, {'mul': 20, 'order': 'mb'}, {'mul': 10, 'order': 'kb'}, {'mul': 1, 'order': 'b'}];
	
	var i = sizes.length;
	if (order) {
		for (var i in sizes) {
			if (sizes[i].order == order) {
				break;
			}
		}
	}
	
	if (sizes[i] == undefined) {
		order = '';
	}
	
	for (var i in sizes) {
		var mul = sizes[i].mul;
		if (! order && size.toInt() >= (1<<mul).toInt()) {
			order = sizes[i].order;
			break;
		}
	}

	size = (size / (1 << sizes[i].mul));
	size = size.round(2);
	
	return size.format({suffix: order});
	
}

function formatDate(date, dateFormat, shortforms) {
	// convert clean timestamp to date object 
	if (typeof(date) == 'number' || typeof(date) == 'string') {
		date = new Date(date * 1000);
		date = removeTimezoneOffset(date);
	}

	// set the timezone offset
	date = new Date(date.getTime() + (serverTimezoneOffset * 1000 * 3600));
	
	if (typeof(shortforms) == "undefined") {
		shortforms = true;
	}
	
	if (typeof(dateFormat) == "undefined" || dateFormat == null) { 
		dateFormat = "%d/%b/%Y %k:%M:%S";
	}
	
	if (shortforms) {
		var calcDate 	= (removeTimezoneOffset(new Date())).getTime() + (serverTimezoneOffset * 1000 * 3600);
		var today 		= new Date(calcDate);
		var yesterday	= new Date(calcDate).decrement('day', 1);
		var lastWeek 	= new Date(calcDate).decrement('week', 1);
		
		if (today.format('%d.%m.%y') == date.format('%d.%m.%y')) {
			return date.format(_t("Today") + ', %H:%M:%S');
		} else if (yesterday.format('%d.%m.%y') == date.format('%d.%m.%y')) {
			return date.format(_t("Yesterday") + ', %H:%M:%S');
		} else if (date > lastWeek) {
			return date.format('%A, %H:%M:%S');
		}
	}
	
	return date.format(dateFormat);
}

function removeTimezoneOffset(date) {
	date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
	return date;
}

function removeServerTimezoneOffset(date) {
	date = new Date(date.getTime() - serverTimezoneOffset * 3600000);
	return date;
}

function formatSize(size, seperator) {
	if (size < 1000) {
		return size;
	}
	
	if (seperator == undefined) {
		seperator = '';
	}
	
	if (size < 1000000) {
		return Math.floor(size / 1000) + seperator + 'k';
	} else {
		return Math.floor(size / 1000000) + seperator + 'm';
	}
}

function formatMiliseconds(miliseconds, seperator) {
	if (miliseconds <= 0) {
		return miliseconds;
	}
	
	if (seperator == undefined) {
		seperator = '';
	}
	
	var seconds = (miliseconds / 1000) % 60;
	var minutes = (miliseconds / (1000*60)) % 60;
	var hours = (miliseconds / (1000*60*60)) % 24;
	
	if (hours >= 16) {
		return hours.round(1) + seperator + 'h';
	} else if (minutes >= 1) {
		return (minutes + (hours * 60)).round(1) + seperator + 'm';
	} else if (seconds >= 1) {
		return seconds.round(1) + seperator + 's';
	} else {
		return miliseconds + seperator + 'ms';
	}
}

var updateUiSessionCookie = true;

//if the user didn't touch the ui in 15 minutes - disconnect it
function delayUiSessionCookie() {
	if (updateUiSessionCookie) {
		var myCookie = Cookie.write('ZS6TTL', 'true', {duration: (1/24/60) * logoutTimeout}); // 15 minutes as default
		updateUiSessionCookie = false;
	}
}

window.addEvent("domready", function(){
	if (logoutTimeout > 0) {
		$(document).addEvent('mousemove', function(e) {
			updateUiSessionCookie = true;
		});
		
		setInterval(function(){ delayUiSessionCookie(); }, 10000); // check every 10 seconds
	}
});

function fnSelect(objId) {
   fnDeSelect();
   if (document.selection) 
   {
      var range = document.body.createTextRange();
      range.moveToElementText(document.getElementById(objId));
      range.select();
   }
   else if (window.getSelection) 
   {
      var range = document.createRange();
      range.selectNode(document.getElementById(objId));
      window.getSelection().addRange(range);
   }
}

function fnDeSelect() {
   if (document.selection)
             document.selection.empty();
   else if (window.getSelection)
              window.getSelection().removeAllRanges();
}

function toggleContent(target) {
	$(target).getParent().toggleClass('mui-vars-open');
	$(target).toggleClass('hidden');
}

Element.implement({
    toJSON: function(){
        var j = {};
        Array.each(this.toQueryString().split('&'),function(a){
            var kv = a.split('=')
            j[kv[0]] = kv[1]||'';
        });
        return JSON.encode(j);
    }
});

Element.implement({
    toObj: function(){
    	var clone = this.clone();
    	clone.getElements('input').set('disabled', false);
    	clone.getElements('select').set('disabled', false);
    	var result = clone.toQueryString().parseQueryString();
    	Object.each(result, function(item, key) {
    		if (item instanceof Array && item.length == 2 && item[0] == '0' && item[1] == '1') {
    			result[key] = '1';
    		}
    	});
        return result;
    }
});

Element.implement({
	  isHidden: function(){
	    var w = this.offsetWidth, h = this.offsetHeight,
	    force = (this.tagName === 'TR');
	    return (w===0 && h===0 && !force) ? true : (w!==0 && h!==0 && !force) ? false : this.getStyle('display') === 'none';
	  },

	  isVisible: function(){
	    return !this.isHidden();
	  }
});

Element.implement({
  setFocus: function(index) {
    this.setAttribute('tabIndex',index || 0);
    this.focus();
  }
});

Array.implement({ 
    attest: function(item, array) { 
        if (!array.contains(item)) this.erase(item); 
        return this; 
    }, 
    intersection: function(array) { 
        for (var i = 0, l = this.length; i < l; i++) 
        	this.attest(this[i], array); 
        return this; 
    } 
}); 

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};

function htmlEntities(str) {
	if (isString(str)) {		
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
	
	return '';
}

function htmlEntitiesReverse(str) {
	if (isString(str)) {
		return String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
	}
	
	return '';
}

window.detectScrollbarWidth = function() {
	// Create the measurement node
	var scrollDiv = document.createElement("div");
	scrollDiv.setStyle('width', '100px');
	scrollDiv.setStyle('height', '100px');
	scrollDiv.setStyle('overflow', 'scroll');
	scrollDiv.setStyle('position', 'absolute');
	scrollDiv.setStyle('top', '-9999px');
	document.body.appendChild(scrollDiv);

	// Get the scrollbar width
	var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

	// Delete the DIV 
	document.body.removeChild(scrollDiv);
	return scrollbarWidth;
};

//overload mootools more mask resize method
Mask.implement('resize', function(x, y){
	
	var opt = {
		styles: []
	};
	if (this.options.masks != undefined) {
		opt.styles = this.options.masks; 
	}
	
	if (this.options.maskMargins) opt.styles.push('margin');

	
	if (this.target.tagName == 'BUTTON') {
		opt.styles.push('border');
	}
	
	var dim = this.target.getComputedSize(opt);
	if (this.target == document.body){
		this.element.setStyles({width: 0, height: 0});
		var win = window.getScrollSize();
		if (dim.totalHeight < win.y) dim.totalHeight = win.y;
		if (dim.totalWidth < win.x) dim.totalWidth = win.x;
	}
	
	this.element.setStyles({
		width: Array.pick([x, dim.totalWidth, dim.x]),
		height: Array.pick([y, dim.totalHeight, dim.y])
	});

	return this;
});

String.implement('htmlEntities', function(quotes) {
	var cleaner = new Element('div');
	cleaner.set('text', String.from(this));
	var output = cleaner.get('html');
	if (quotes) {
		output = output.replace(/"/g, '&quot;');
	}
	return output;
});

function isString(o) {
	if (!o) {
		return false;
	}
    return typeof o == "string" || (typeof o == "object" && o.constructor === String);
}

if (Object.hasOwnProperty.call(window, "ActiveXObject") && !window.ActiveXObject) {
	Browser.ie = true;
	Browser.version = document.documentMode;
}