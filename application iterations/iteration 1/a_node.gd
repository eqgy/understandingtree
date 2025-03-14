extends Node2D

var children = 0
@onready var problem_leaf = $problem
@onready var solution_leaf =$solution
var problems = 0
var solutions = 0
var stop = 0
var too = "A NODE"
var has_line = false
var sol_counterarg = 0
var prob_counterarg = 0
var prob_diverges = 0
var solution_diverges = 0
var installationdata
var type = 0 #KEY: 0=origin node, 1= problem expand, 2= solution expand, 3= problem diverge, 4 = solution diverge, 5 = counter argument
var id #set by globalcount function, for export identification

@onready var parent
signal problem_or_solution

func globalcount():
	id = Globals.nodecount
	print(id)
	Globals.nodecount +=1

func _ready():
	connect("problem_or_solution", _on_expand_pressed2)
	add_custom_line_edit_to_child(2)  # <-- Highlighted change
	globalcount()

func determine_type():
	var is_expand = false
	parent = get_parent()
	if parent == null || parent is Node2D:
		pass
	else:
		is_expand = true
		parent = parent.get_parent()
	return is_expand

func add_line():
	if parent == null:
		if stop <= 30:
			stop += 1
			parent = get_parent()
			if parent == null || parent is Node2D:
				pass
			else:
				parent = parent.get_parent()
	if parent != null:
		if has_line == false:
			if parent is Node2D && "too" in parent:
				var line = Line2D.new()
				line.add_point(Vector2(0,0)) # Add a point at its initial position
				var new_x = -position.x
				if type == 1 || type == 2:
					new_x = -(position.x-150) #If the branch is being expanded, ensure that the line is centered on the button
				var new_y = -position.y
				var new_pos = Vector2(new_x, new_y)
				line.add_point(new_pos)
				line.z_index = -1
				add_child(line)
			has_line = true

func add_line_counterarg():
	var line = Line2D.new()
	line.add_point(Vector2(0,0)) # Add a point at its initial position
	var new_x = -position.x
	var new_y = -position.y
	var new_pos = Vector2(new_x, new_y)
	line.add_point(new_pos)
	line.z_index = -1
	add_child(line)
	
func _process(delta):
	if stop <= 30:
		add_line()
	

func problem_counterarg():
	var done = false
	if !solution_leaf.visible:
		solution_leaf.visible = true
	else:
		var count = 0
		var par = self
		var first_node = self
		while (! "problems" in par):
			par = par.get_parent()
		for c in first_node.get_children():
			if "problems" in c:
				count +=1
				if !c.solution_leaf.visible:
					c.solution_leaf.visible = true
					done = true
					break
		if !done:
			var child = load("res://a node.tscn").instantiate()
			child.type = 5
			var position_offset = Vector2(300 + 300*count, 0)
			child.position = position_offset
			first_node.add_child(child)
			child.add_line_counterarg()
			child.solution_leaf.visible = true
			child.problem_leaf.visible = false

func solution_counterarg():
	var done = false
	if !problem_leaf.visible:
		problem_leaf.visible = true
	else:
		var count = 0
		var par = self
		var first_node = self
		while par:
			first_node = par
			par = par.get_parent()
		for c in first_node.get_children():
			if "problems" in c:
				count +=1
				if !c.problem_leaf.visible:
					c.problem_leaf.visible = true
					done = true
					break
		if !done:
			var child = load("res://a node.tscn").instantiate()
			child.type = 5
			var position_offset = Vector2(300+count * 300, 0)
			child.position = position_offset
			first_node.add_child(child)
			child.add_line_counterarg()
			child.solution_leaf.visible = false
			child.problem_leaf.visible = true

func _on_expand_pressed2(arg):
	var child = load("res://a node.tscn").instantiate()
	var off_set_weight
	if arg == 1:
		off_set_weight = problems
	else:
		off_set_weight = solutions
	var position_offset = Vector2(450, arg * 200) # 100 is the length of the button
	child.position = position_offset
	child.add_line()
	if arg == 1: # If it is a problem , add the child to title2
		if (problems != 0):
			var expand_parent = self
			for c in $problem.get_children():
				if "problems" in c:
					expand_parent = c
			expand_parent._on_expand_pressed2(1)
		else:
			problem_leaf.add_child(child)
			problems+= 1
			child.get_node("solution").visible = false
			child.type = 1
	else: # If it is a solution, add the child to title
		if (solutions != 0):
			var expand_parent = self
			for c in $solution.get_children():
				if "problems" in c:
					expand_parent = c
			expand_parent._on_expand_pressed2(-1)
		else:
			solution_leaf.add_child(child)
			solutions += 1
			child.get_node("problem").visible = false
			child.type = 2
	
	# Add a CustomLineEdit to the child
	add_custom_line_edit_to_child(2)  # <-- Highlighted change

func problem_diverge():
	var child = load("res://a node.tscn").instantiate()
	var position_offset = Vector2(0, 400 * (prob_diverges+1))
	child.position = position_offset
	child.add_line()
	add_child(child)
	prob_diverges += 1
	child.get_node("solution").visible = false
	child.type = 3
	# Add a CustomLineEdit to the child
	add_custom_line_edit_to_child(2)  # <-- Highlighted change

func solution_diverge():
	print("IM TRYING")
	var child = load("res://a node.tscn").instantiate()
	var position_offset = Vector2(0, -400 * (solution_diverges+1))
	child.position = position_offset
	child.add_line()
	add_child(child)
	solution_diverges += 1
	child.get_node("problem").visible = false
	child.type = 4
	
	# Add a CustomLineEdit to the child
	add_custom_line_edit_to_child(2)  # <-- Highlighted change

func problem_expand():
	emit_signal("problem_or_solution", 1)

func solution_expand():
	emit_signal("problem_or_solution", -1)

# Helper function to add a CustomLineEdit to a child
# Function to add a CustomLineEdit to the corresponding title parent
func add_custom_line_edit_to_child(num):
	
	if num == 2:
		var custom_line_edit = Text.new()  # Create an instance of CustomLineEdit
		custom_line_edit.text = "Branch " + str(children)  # Set default text
		custom_line_edit.position = Vector2(20, 12)  # Position it above the title
		#$title.add_child(custom_line_edit)  # Attach it to title
		
		var custom_line_edit2 = Text.new()  # Create an instance of CustomLineEdit
		custom_line_edit2.text = "Branch " + str(children)  # Set default text
		custom_line_edit2.position = Vector2(20, 12)  # Position it above the title
		#$title2.add_child(custom_line_edit2)  # Attach it to title2
		
		custom_line_edit.z_index = 10  # Ensure it is drawn above other elements
		custom_line_edit2.z_index = 10  # Ensure it is drawn above other elements
		
		
func _on_button_toggled(toggled_on):
	pass



func _on_solution_delete_pressed():
	parent = get_parent()
	if type == 0:
		print("this is the base node. You cannot delete it.")
		return
	if type == 1 || type == 2:
		parent = parent.get_parent()
		parent.solutions -=1
	elif type ==3  || type == 4:
		parent.solution_diverges -=1
	for child in $solution.get_children():
		child.queue_free()
	if $solution.visible:
		$solution.visible = false
	if $problem.visible == false:
		queue_free()
	

func _on_problem_delete_pressed() -> void:
	parent = get_parent()
	if type == 0:
		print("this is the base node. You cannot delete it.")
		return
	if type == 1 || type == 2:
		parent = parent.get_parent()
		parent.problems-=1
	elif type == 3 || type == 4:
		parent.prob_diverges -=1
	for child in $problem.get_children():
		child.queue_free()
	if $problem.visible:
		$problem.visible = false
	if $solution.visible == false:
		queue_free()

func export()-> String:
	if id > 1:
		if (type == 5):
			installationdata = str(get_parent().id)
		else:
			installationdata = str(get_parent().get_parent().id)
	else:
		installationdata = str(0)
	var i = str(id)
	var t = str(type)
	installationdata += " " + i + " " + t
	var data = installationdata+ "[s]" + $solution.text + " [p]" + $problem.text + "\n"
	
	for child in get_children():
		print("child" + child.name)
		if (child.name == "problem") or (child.name == "solution"):
			for c in child.get_children():
				if c.name == "node":
					print("running export on child")
					data = data + c.export()
		if (child.name == "node"):
			print("running export on counter-arg child")
			data = data + child.export()
	return data
