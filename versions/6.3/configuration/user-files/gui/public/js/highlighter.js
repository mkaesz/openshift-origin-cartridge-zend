var Highlighter = new Class({
    
	  /* implements */
	  Implements: [Options],

	  /* options */
	  options: {
	    autoUnhighlight: true,
	    caseSensitive: false,
	    elements: '*',
	    className: '',
	    onlyWords: false,
	    tag: 'span'
	  },
	  
	  /* initialization */
	  initialize: function(options) {
	    /* set options */
	    this.setOptions(options);
	    this.elements = $$(this.options.elements);
	    this.words = [];
	  },
	  
	  /* directs the plugin to highlight elements */
	  highlight: function(words,elements,className) {
	    
	    /* figure out what we need to use as element(s) */
	    var elements = $$(elements || this.elements);
	    var klass = className || this.options.className;
	    if (words.constructor === String) { words = [words]; }
	    
	    /* auto unhighlight old words? */
	    if(this.options.autoUnhighlight) { this.unhighlight(); }
	    
	    /* set the pattern and regex */
	    var pattern = '(' + words.join('|') + ')';
	    pattern = this.options.onlyWords ? '\\b' + pattern + '\\b' : pattern;
	    var regex = new RegExp(pattern, this.options.caseSensitive ? '' : 'i');
	    
	    /* run it for each element! */
	    elements.each(function(el) { this.recurse(el,regex,klass); },this);
	    
	    /* make me chainable! */
	    return this;
	  }, 
	  
	  /* unhighlights items */
	  unhighlight: function(words) {
	    //var selector = this.options.tag + (word ? '[rel=' + word + ']' : '');
		  
	    if (words.constructor === String) { words = [words]; }
	    
	    words.each(function(word) {
	      word = (this.options.caseSensitive ? word : word.toUpperCase());
	      if(this.words[word]) {
	        var elements = $$(this.words[word]);
	        elements.set('class','');
	        elements.each(function(el) {
	          var tn = document.createTextNode(el.get('text'));
	          el.getParent().replaceChild(tn,el);
	          console.log(tn);
	        });
	      }
	    },this);
	    return this;
	  },
	  
	  /* recursed function */
	  recurse: function(node,regex,klass) {
	      if (node.nodeType === 3) {
	        var match = node.data.match(regex);
	        if (match) {
	          /* new element */
	          var highlight = new Element(this.options.tag);
	          highlight.addClass(klass);
	          var wordNode = node.splitText(match.index);
	          wordNode.splitText(match[0].length);
	          var wordClone = wordNode.cloneNode(true);
	          highlight.appendChild(wordClone);
	          wordNode.parentNode.replaceChild(highlight, wordNode);
	          highlight.set('rel',highlight.get('text'));
	          var comparer = highlight.get('text');
	          if(!this.options.caseSensitive) { comparer = highlight.get('text').toUpperCase(); }
	          if(!this.words[comparer]) { this.words[comparer] = []; }
	          this.words[comparer].push(highlight);
	          return 1;
	        }
	      } else if ((node.nodeType === 1 && node.childNodes) && !/(script|style)/i.test(node.tagName) && !(node.tagName === this.options.tag.toUpperCase() && node.className === klass)) {
	        for (var i = 0; i < node.childNodes.length; i++) {
	          i += this.recurse(node.childNodes[i],regex,klass);
	        }
	      }
	      return 0;
	    }
	  });
