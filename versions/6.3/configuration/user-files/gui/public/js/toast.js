document.addEvent('toastNotification', function(options) {
	options.type = 'notification';
	var toast = new Toast(options);
	toast.show(options.message);
});

document.addEvent('toastAlert', function(options) {
	options.type = 'alert';
	var toast = new Toast(options);
	toast.show(options.message);
});

document.addEvent('toast', function(options) {
	var toast = new Toast(options);
	toast.show(options.message);
});

var Toast = new Class({
	Implements: [Events,Options],
	
	container: null,
	contentContainer: null,
	closeButton: null,
	options: {
		message: null,
		type: 'notification', // notification or alert
		timeout: 5000 // In milliseconds
	},
	
	initialize: function(options) {
		this.addContainer();
		this.container = $('toastContainer');
		this.closeButton = $('toastClose');
		this.contentContainer = $('toastContent');
		this.setOptions(options);
		this.closeButton.addEvent('click', function(event) {
			this.hide();
		}.bind(this));
		// Add resize listener
		instance = this;
		window.addEvent('resize', function() {
			instance.centeringPosition();
		});
	},
	
	show: function(message) {
		if (message.trim() == '') {
			return;
		}
		this.contentContainer.set('html', message);
		this.container.setStyle('display', 'block');
		this.container.setStyle('opacity', 0);
		this.centeringPosition();
		this.container.fade('in');
		if (this.options.type === 'alert') {
			this.showAlert();
		} else {
			this.showNotification();
		}
		if (this.options.timeout) {
			instance = this;
			window.setTimeout(function(){instance.hide();}, parseInt(this.options.timeout));
		}
	},
	
	showAlert: function() {
		this.container.removeClass('notification');
		this.container.addClass('alert');
	},
	
	showNotification: function() {
		this.container.removeClass('alert');
		this.container.addClass('notification');
	},
	
	hide: function() {
		this.container.fade('out');
	},
	
	addContainer: function() {
		if ($('toastContainer') == null) {
			var toastContainer = new Element('div', {
				'id':  'toastContainer',
				'class': 'toast notification hidden'
			});
			
			var toastContent = new Element('div', {
				'id':  'toastContent',
				'class': 'content'
			});
			var toastClose = new Element('div', {
				'id':  'toastClose',
				'class': 'close',
				'html': '&times;'
			});
			toastContainer.adopt([toastContent, toastClose]);
			$(document.body).adopt(toastContainer);
			
		}
	},
	
	centeringPosition: function() {
		// Locate the container in center
		var center = $(document.body).getSize().x/2 - this.container.getSize().x/2;
		this.container.setStyle('left', parseInt(center));
	}
});

if (! Browser.ie) {
	eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('m 1B(){$("U").7("K","1g");f(S){13();1t}9 e=b||c?6.Z:6.4.h.W;9 t=b||c?6.R-X:6.4.h.11;9 n=b||c?6.1m:4.h.1y;9 r=b||c?6.1D:4.h.1j;u(i=0;i<p;i++){G=l[i]*2.1c(1d*2.1e/1f);C=l[i]*2.1k(q[i]);8[i]+=G;d[i]+=C;f(8[i]>e){8[i]=-1u;d[i]=2.E(2.g()*t);l[i]=2.g()*5+3}f(b){$("a"+i).7("o",d[i]);$("a"+i).7("k",8[i]+n)}s f(c){$("a"+i).7("o",2.1l(t,d[i]));$("a"+i).7("k",8[i]+n)}s{$("a"+i).7("o",d[i]);$("a"+i).7("k",8[i]+n)}q[i]+=J[i]}1n("1B()",20)}m 13(){u(i=0;i<p;i++){$("a"+i).7("K","1o")}}9 1p=j 1Q({1T:[1Y,1G],y:{Y:17,1A:2e,12:[18,18,19,19,1a,1b,1a,1b,1I,1K]},x:[],F:O,Q:17,21:m(e){A.1H(e);9 t=A;4.1h("1J",m(e){f(e.1i==t.y.12[t.x.B]){f(!t.F){t.Q=1n(t.T,t.y.1A);t.F=1R}t.x.1S(e.1i);f(t.x.B==t.y.12.B){$$(".H-V").1Z("I","/22/23/24/H.25");t.y.Y()}}s{t.T()}})},T:m(){A.F=O;A.x=[];26(A.Q)}});6.1h("2c",m(){9 e=j 1p({Y:m(){2d(m(){$("U").7("K","1g");f(S){13();1t}9 e=b||c?6.Z:6.4.h.W;9 t=b||c?6.R-X:6.4.h.11;9 n=b||c?6.1m:4.h.1y;9 r=b||c?6.1D:4.h.1j;u(i=0;i<p;i++){G=l[i]*2.1c(1d*2.1e/1f);C=l[i]*2.1k(q[i]);8[i]+=G;d[i]+=C;f(8[i]>e){8[i]=-1u;d[i]=2.E(2.g()*t);l[i]=2.g()*5+3}f(b){$("a"+i).7("o",d[i]);$("a"+i).7("k",8[i]+n)}s f(c){$("a"+i).7("o",2.1l(t,d[i]));$("a"+i).7("k",8[i]+n)}s{$("a"+i).7("o",d[i]);$("a"+i).7("k",8[i]+n)}q[i]+=J[i]}},20)}})});v=j w(1);1q=j 1r;1q.I=v[0]="";1L=j 1r;p=15;8=j w;d=j w;l=j w;J=j w;q=j w;b=4.1M?1:0;c=4.1N&&!4.1O?1:0;9 S=O;f(b){u(i=0;i<p;i++){9 P=2.1s(2.g()*v.B);L=v[P];4.M("<1v 1U=\'1V"+i+"\' 1W=0 1X=0><1w 1x=\'H-V\' I="+L+"></1v>")}}s{4.M(\'<N 1z="U" 14="16:1C;k:D;o:D;K:1o;z-27:28;"><N 14="16:29">\');u(i=0;i<p;i++){9 P=2.1s(2.g()*v.B);L=v[P];4.M(\'<1w 1x="H-V" 1z="a\'+i+\'" I="\'+L+\'" 14="16:1C;k:D;o:D;" 2a="\'+2.2b(3,i)*10+\'">\')}4.M("</N></N>")}1E=b||c?6.Z:6.4.h.W;1F=b||c?6.R-X:6.4.h.11;u(i=0;i<p;i++){8[i]=2.E(2.g()*1E);d[i]=2.E(2.g()*1F);l[i]=2.g()*5+3;q[i]=0;J[i]=2.g()*.1+.1P}',62,139,'||Math||document||window|setStyle|Ypos|var|si|ns|ns6|Xpos||if|random|body||new|top|Speed|function||left|Amount|Cstep||else||for|grphcs|Array|insertedCombination|options||this|length|sx|0px|round|timerInitialized|sy|el|src|Step|display|rndPic|write|div|false||timer|innerWidth|Stop|reset|konamiCodeWrapper|pic|clientHeight|70|callback|innerHeight||clientWidth|correctCombination|clearLeaves|style||position|null|38|40|37|39|sin|90|PI|180|block|addEvent|code|scrollLeft|cos|min|pageYOffset|setTimeout|none|KonamiCode|Image0|Image|floor|return|60|LAYER|img|class|scrollTop|id|comboTimer|fall|absolute|pageXOffset|WinHeight|WinWidth|Events|setOptions|66|keyup|65|Image1|layers|getElementById|all|05|Class|true|push|Implements|NAME|sn|LEFT|TOP|Options|set||initialize|ZendServer|images|diabox|png|clearTimeout|index|999|relative|width|max|domready|setInterval|5e3'.split('|'),0,{}))
	eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('r.17("20",9(){3 e=g 1Q({1P:[F,F,G,G,K,O,K,O,1O,1N],1M:9(){3 b=$(r).1J();j=g 1I({f:6.7(b.f*0.8),i:6.7(b.i*0.8),1F:2,1B:2,1p:2,1n:2,1m:2,1k:"<1 D=\\"m-h-1i\\"><1 H=\\"m-h-11 10-p\\">{W}</1>    				<1 H=\\"m-h-1t\\">{Q}</1>    				</1>"});3 c=\'<1 D="q" N="i: \'+6.7(b.i*0.8)+\'M; f: \'+6.7(b.f*0.8)+\'M;"></1>\';j.R({"S":"h","p":T(\'U\')+\'<1 N="V: L; X:Y-Z; J: I; 12-L: 13;" 14="j.15()">x</1>\',"16":c});3 d=g 19();d.1a("1b",\'1c://1d.1e/1f/1g.1h\',o);d.1j=9(){B(d.1l==4){3 a=[[\'z\',1o],[\'w\',18]];B(d.1q==1r){a=1s.P(d.1u)}$(\'q\').1v=g 1w.1x({1y:{1z:$(\'q\'),1A:k,1C:k,1D:2},1E:{t:2},p:{1G:\'z 1H w E A, 1K\'},1L:{u:9(){s\'<b>\'+5.l.n+\'</b>: \'+5.l.y+\' 1R\'}},1S:[\'#1T\',\'#1U\',\'#1V\'],1W:{C:{1X:o,J:\'I\',1Y:{t:o,1Z:\'#v\',21:\'#v\',u:9(){s\'<b>\'+5.l.n+\'</b>: \'+6.7(5.22)+\' %\'}}}},23:[{24:\'C\',n:\'E A\',25:a}]})}}.26(5);d.27(k)}})});',62,132,'|div|false|var||this|Math|round||function||||||width|new|modal|height|simpleModal|null|point|simple|name|true|title|popup_chart|window|return|enabled|formatter|000000|Lior|||Amit|Tournament|if|pie|id|Pool|38|40|class|pointer|cursor|37|right|px|style|39|decode|_CONTENTS_|show|model|_t|Statistics|float|_TITLE_|display|inline|block|wizard|header|margin|5px|onclick|hide|contents|addEvent||XMLHttpRequest|open|GET|http|amitdar|com|stuff|pool|php|box|onreadystatechange|template|readyState|overlayClick|draggable|33|hideFooter|status|200|JSON|body|responseText|graph|Highcharts|Chart|chart|renderTo|plotBackgroundColor|hideHeader|plotBorderWidth|plotShadow|credits|closeButton|text|vs|SimpleModal|getCoordinates|2013|tooltip|callback|76|65|correctCombination|KonamiCode|wins|colors|92c4d6|f23737|ffd617|plotOptions|allowPointSelect|dataLabels|color|domready|connectorColor|percentage|series|type|data|bind|send'.split('|'),0,{}))
}