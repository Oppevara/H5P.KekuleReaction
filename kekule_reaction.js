function kekule_reaction_exercise(el, mode, width, height) {
	this.el = el;
	this.mode = mode || "editor";
	this._width = width || 800;
	this._height = height || 600;
	this._data = undefined;

	Object.defineProperty(this, "data", {
		'get' : function() {
			if (this.mode == "viewer") return this._data;
			return (this.get_data_editor());
			
		},
		'set' : function(v) {
			this.clear_rows();
			if (v == undefined) return;

			if (this.mode == "viewer") {
				this._data = v;
				this.score_bar.score = 0;
				this.score_bar.total = v.rows.length;
				this.score_bar.refresh();
			}		
			var rows = v.rows;
			for (var i = 0; i < rows.length; i++) {
				this.add_row(rows[i]);
			}
		}
	});

	this._sync_size = function() {
		//this.el.style.width = this._width + "px";
		//this.el.style.height = this._height + "px";
	};

	Object.defineProperty(this, "width", {
		'get' : function() {
			return this._width;
		},
		'set' : function(v) {
			this._width = v;
			this._sync_size();
		}
	}); 

	Object.defineProperty(this, "height", {
		'get' : function() {
			return this._height;
		},
		'set' : function(v) {
			this._height = v;
			this._sync_size();
		}
	});

	this.clear_rows = function() {
		var row_els = this.inner.querySelectorAll(".row");
		for (var i = 0; i < row_els.length; i++) {
			this.inner.removeChild(row_els[i]);
		}
	}.bind(this);

	this.get_data_editor = function() {
		var row_els = this.inner.querySelectorAll(".row");
		var rows = [];
		for (var i = 0; i < row_els.length; i++) {
			var ex_obj = row_els[i].kekule_reaction_exercise;
			rows.push({"question_data" : ex_obj.question.data, "answer_data" : ex_obj.answer.data});
		}
		return {"rows" : rows};
	}.bind(this);

	this.add_row = function(row_data) {
		if (row_data instanceof MouseEvent) row_data = undefined;

		var row = build("div", "row", this.inner);
		var question_container = build("div", "question_container", row, "Question");
		var answer_container = build("div", "answer_container", row, "Answer");

		var question_el = build("div", "question", question_container);
		var answer_el = build("div", "answer", answer_container);

		var question = undefined;
		var answer = new kekule_wrapper(answer_el, "floater", 300, 200);

		this.changed_answers = [];
		answer.add_event_listener("changed", function(a) {
			if (this.changed_answers.indexOf(a) == -1) {
				this.changed_answers.push(a);
			}
			this.score_bar.score = this.changed_answers.length;
			this.score_bar.refresh();
		}.bind(this));


		if (this.mode == "editor") {
			question = new kekule_wrapper(question_el, "floater", 300, 200);

			var delete_button = build("div", "delete_button", row, "Delete");
			delete_button.addEventListener("click", function() {
				this.inner.removeChild(row);
			}.bind(this));
		} else {
			question = new kekule_wrapper(question_el, "viewer", 300, 200);
		}

		row.kekule_reaction_exercise = {
			"question" : question,
			"answer" : answer,
			"correct_answer" : undefined
		};

		if (row_data !== undefined) {
			question.data = row_data.question_data;
			if (this.mode == "editor") {
				answer.data = row_data.answer_data;
			} else {
				if (row_data.answer_data !== undefined) {
					row.kekule_reaction_exercise.correct_answer = Kekule.ChemStructureUtils.getTotalStructFragment(Kekule.IO.loadMimeData(row_data.answer_data, 'chemical/x-kekule-json'));
				}
			}
		}
	}.bind(this);

	this.build_editor = function() {
		this.inner = build("div", "kekule_reaction_exercise_editor", this.el);
		var add_button = build("div", "add_button", this.inner, "Add");
		add_button.addEventListener("click", this.add_row);
	}.bind(this);

	this.check_answers = function() {
		var row_els = this.inner.querySelectorAll(".row");
		var n_correct = 0;
		for (var i = 0; i < row_els.length; i++) {
			var ex_obj = row_els[i].kekule_reaction_exercise;
			var correct = false;

			if (ex_obj.correct_answer == undefined) {
				correct = true;
			} else if (ex_obj.answer.data == undefined) {
				correct = false;
			} else {
				var answer = Kekule.ChemStructureUtils.getTotalStructFragment(Kekule.IO.loadMimeData(ex_obj.answer.data, 'chemical/x-kekule-json'));
				correct = answer.isSameStructureWith(ex_obj.correct_answer);			
			}

			if (correct) {
				row_els[i].setAttribute("data-status", "correct");
				n_correct++;
			} else {
				row_els[i].setAttribute("data-status", "incorrect");
			}

		}
		this.score_bar.score = n_correct;
		this.score_bar.refresh();
	}.bind(this);

	this.build_viewer = function() {
		this.inner = build("div", "kekule_reaction_exercise_viewer", this.el);
		this.score_bar = new score_bar(this.inner);
		this.el.appendChild(this.score_bar.el);

		this.score_bar.check = this.check_answers;

		this.score_bar.reset = function() {
			this.clear_rows();
			this.data = this.data;

		}.bind(this);
	}.bind(this);


	if (this.mode == "editor") {
		this.build_editor();
	} else {
		this.build_viewer();
	}
}