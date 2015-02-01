var deploymentLibrariesGrid = new Class({
	'Extends': zGrid2,
	'overrideOpenrowData': function(data, position){

		// pick up all currect grid ids
		var dataRows = [];
		data.each(function(row, key) {
			var rowId = this.getRowId(row);
			/// filter out those keys that are not loaded into the grid
			if (! zgrid2.getRowData(rowId)) {
				delete data[key];
			}
			dataRows.push(rowId);
		}.bind(this));
		
		// delete all rows that not exists in the data
		Object.each(zgrid2.getRowsData(), function(row, key) {
			if ((isNaN(key)) && (! dataRows.contains(key))) {
				this.deleteRow(key);
			}
		}.bind(this));
		
		if (data.length > 0) {
			// update all rows
			this.updateData(data, position);
		} else if (! this.noData) {
			this.createNoDataRow();
		}
	}
});