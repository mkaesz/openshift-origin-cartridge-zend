/*
---

name: Form.Upload
description: Create a multiple file upload form
license: MIT-style license.
authors: Arian Stolwijk
requires: [Form.MultipleFileInput, Request.File]
provides: Form.Upload

...
*/

if (!this.Form) this.Form = {};

Form.Upload = new Class({

	Implements: [Options, Events],

	options: {
		dropMsg: 'You can drag & drop a deployment package here',
		onComplete: function(){
			// reload
			window.location.href = window.location.href;
		}
	},

	initialize: function(input, options){
		input = this.input = document.id(input);
		
		this.setOptions(options);

		// Our modern file upload requires FormData to upload
		if ('FormData' in window) this.modernUpload(input);
		else this.legacyUpload(input);
	},

	modernUpload: function(input){

		this.modern = true;

		var form = input.getParent('form');
		if (!form) return;

		var self = this,

			drop = new Element('div.droppable', {
				id: 'droppable',
				text: this.options.dropMsg
			}).inject(input, 'after')//.setStyle('display', 'none'),
			
			list = new Element('ul.uploadList').inject(drop, 'after'),

			progress = new Element('progress', {min: 0, max: 100, value: 0})
				.setStyle('display', 'none').inject(list, 'after'),
				
			precent = new Element('div.precent')
				.setStyle('display', 'none').inject(progress, 'after'),

			inputFiles = new Form.MultipleFileInput(input, list, drop, {
				onDragenter: drop.addClass.pass('hover', drop),
				onDragleave: drop.removeClass.pass('hover', drop),
				onDrop: drop.removeClass.pass('hover', drop)
			}),

			uploadReq = new Request.File({
				url: form.get('action'),
				evalScripts: true,
				onRequest: function() {
					progress.setStyle('display', 'block');
					precent.setStyle('display', 'block');
					progress.value = 0;
					precent.set('text', '0%');
				},
				onProgress: function(event){
					var loaded = event.loaded, total = event.total;
					if (total != 0) {
						progress.value = parseInt(loaded / total * 100, 10);
					}					
					precent.set('text', progress.value + '%');
				},
				onComplete: function(response){
					progress.value = 100;
					precent.set('text', '100%');
					self.fireEvent('complete', response);
				}
			}),

			inputname = input.get('name');

		form.addEvent('submit', function(event){
			event.preventDefault();
			inputFiles.getFiles().each(function(file){
				uploadReq.append(inputname , file);
			});
			inputFiles.clear();
			uploadReq.send();
		});

	},

	legacyUpload: function(input){
		
		var row = input.getParent('.formRow');
			
//			rowClone = row.clone(),
			add = function(event){
				event.preventDefault();
//				var newRow = rowClone.clone();

//				newRow.getElement('input').grab(new Element('a.delInputRow', {
//					text: 'x',
//					events: {click: function(event){
//						event.preventDefault();
//						newRow.destroy();
//					}}
//				}), 'after');

				//newRow.inject(row, 'after');
			};

		new Element('a.addInputRow', {
			text: '+',
			events: {click: add}
		}).inject(input, 'after');

	},

	isModern: function(){
		return !!this.modern;
	}

});
