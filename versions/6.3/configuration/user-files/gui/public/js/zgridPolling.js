var zGridPolling = new Class({
	Implements: [Options,Events],
	options: {
		'interval': 2000,
        'maxIterations': 0
	},
	pollTimer: null,
	pollingActive: false,
    pollIterations: 0,
	/// Use Class.Binds to avoid scope reset in internal methods
	Binds: ['_poll', 'next', 'start', 'stop'],
	start: function() {
		if (this.pollingActive) {
			return ;
		}
		this.pollingActive = true;
		this._poll();
		this.fireEvent('start', this.options);
	},
	
	stop: function() {
		this.fireEvent('stop', this.options);
		clearTimeout(this.pollTimer);
		this.pollTimer = null;
		this.pollingActive = false;
	},
	
	next: function() {
		if (! this.pollingActive) {
			this.fireEvent('stopped', this.options);
			return ;
		}
        if (this.options.maxIterations > 0 && this.options.maxIterations <= this.pollIterations) {
            this.stop();
            this.fireEvent('maxIteration', this.options);
            return ;
        }
		this.pollTimer = this._poll.delay(this.options.interval);
		this.fireEvent('next', this.options);
	},
	
	_poll: function() {
		clearTimeout(this.pollTimer);
		this.pollTimer = null;
		if (! this.pollingActive) {
			this.fireEvent('stopped', this.options);
			return ;
		}
		this.fireEvent('poll', this.options);
        this.pollIterations++;
	}
})

var tasksPolling = new Class({
	'Extends': zGridPolling,
	tasks: {},
	Binds: ['_mapTasks', '_poll', 'next', 'start', 'stop', 'setTask', 'removeTask', 'resetTasks', 'getTask', 'getTasks'],
    initialize: function(tasks){
            this._mapTasks(tasks);
    },
    setTask: function(id, task) {
            this.tasks[id] = task;
    },
    hasTask: function(task) {
		return Object.filter(this.tasks, function(apptask, id){
			return (task == apptask);
		});
    },
    removeTask: function(id){
            delete this.tasks[id];
    },
    resetTasks: function() {
            this.tasks = {};
    },
    getTask: function(id) {
            return this.tasks[id];
    },
    getTasks: function() {
            return this.tasks;
    },
	_mapTasks: function(tasks) {
		Object.each(tasks, function(ids, task) {
			ids.each(function(id){
				this.setTask(id, task);
			}.bind(this));
		}.bind(this));
	}
});