var monitorRules = new Class({
	Extends: zGrid2,
	
	expandRow: function(rowId, rowData) {
		this.parent(rowId, rowData);
		
		// if opens some rule we need to close the all others
		if ($("tableRow_" + rowId).hasClass('active')) {
			if (rowId.split("_").length > 2 || rowId.contains('Global_')) {
				$("tableRow_" + rowId).removeClass('active');				
			} else {
				Object.each(Object.keys(this.data), function(id) {
					if (rowId != id && $("tableRow_" + id).hasClass('active')) {
						this.fireEvent('descriptionClose', this.getDescriptionParams(id));
						$("tableRow_" + id).toggleClass("active");
						this.removeHash('grid', id);
					}
				}, this);
			}
		}
	}
});