/*
---

name: MooPlaceholder

description: This simple plugin provides HTML 5 placeholder attribute to all browsers.

license: MIT-style

authors:
- Alexey Gromov
- Arian Stolwijk
- Phil Freo

requires: [Core/Element]
provides: [Element.MooPlaceholder, MooPlaceholder]

...
*/

(function(){var b="placeholder";var a=function(){a=Function.from(b in document.createElement("input"));return a()};Element.implement("MooPlaceholder",function(c){var d=this,g;if(a()){return d}if(!c){c="#aaa"}var h=d.get(b),f=d.getStyle("color"),e=d.getParent("form");d.setStyle("color",c).set("value",h);d.addEvents({focus:function(){g=d.get("value");if(g==""||g==h){d.setStyle("color",f).set("value","")}},blur:function(){g=d.get("value");if(g==""||g==h){d.setStyle("color",c).set("value",h)}}});if(e){e.addEvent("submit",function(){if(d.get("value")==h){d.set("value","")}})}return d});this.MooPlaceholder=function(d,c){if(!c){c="input["+b+"],textarea["+b+"]"}$$(c).MooPlaceholder(d)}})();
