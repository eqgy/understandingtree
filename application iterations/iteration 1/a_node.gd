extends Node2D

var children = 0
var problems = 0
var solutions = 0
var stop = 0
var too = "A NODE"
var has_line = false

var prob_diverges = 0
var solution_diverges = 0

@onready var parent
signal problem_or_solution

func _ready():
	connect("problem_or_solution", _on_expand_pressed2)
	add_custom_line_edit_to_child(2)  # <-- Highlighted change

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
				line.add_point(Vector2(0, 0)) # Add a point at its initial position
				var new_x = position.x
				var new_y = position.y - 10
				var new_pos = Vector2(new_x, new_y)
				line.add_point(-position)
				line.z_index = -1
				add_child(line)
			has_line = true

func _process(delta):
	if stop <= 30:
		add_line()

func _on_addbranch_pressed():
	var child = load("res://a node.tscn").instantiate()
	var position_offset = Vector2(400 * children, 20 * children)
	child.position = position_offset
	child.add_line()
	children += 1
	$title2.add_child(child)
	
	# Add a CustomLineEdit to the child
	add_custom_line_edit_to_child(2)  # <-- Highlighted change
	print(children)

func _on_expand_pressed2(arg):
	var child = load("res://a node.tscn").instantiate()
	var off_set_weight
	if arg == 1:
		off_set_weight = problems
	else:
		off_set_weight = solutions
	var position_offset = Vector2(400, arg * 100 + 200 * off_set_weight * arg) # 100 is the length of the button
	child.position = position_offset
	child.add_line()
	if arg == 1: # If it is a problem, add the child to title2
		$title2.add_child(child)
		problems += 1
	else: # If it is a solution, add the child to title
		$title.add_child(child)
		solutions += 1
	
	# Add a CustomLineEdit to the child
	add_custom_line_edit_to_child(2)  # <-- Highlighted change
	print(children)

func problem_diverge():
	var child = load("res://a node.tscn").instantiate()
	var position_offset = Vector2(0, 300 + 200 * prob_diverges)
	child.position = position_offset
	child.add_line()
	add_child(child)
	prob_diverges += 1
	
	# Add a CustomLineEdit to the child
	add_custom_line_edit_to_child(2)  # <-- Highlighted change

func solution_diverge():
	var child = load("res://a node.tscn").instantiate()
	var position_offset = Vector2(0, -300 - 200 * solution_diverges)
	child.position = position_offset
	child.add_line()
	add_child(child)
	solution_diverges += 1
	
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
		$title.add_child(custom_line_edit)  # Attach it to title
		
		var custom_line_edit2 = Text.new()  # Create an instance of CustomLineEdit
		custom_line_edit2.text = "Branch " + str(children)  # Set default text
		custom_line_edit2.position = Vector2(20, 12)  # Position it above the title
		$title2.add_child(custom_line_edit2)  # Attach it to title2
		
		custom_line_edit.z_index = 10  # Ensure it is drawn above other elements
		custom_line_edit2.z_index = 10  # Ensure it is drawn above other elements
func _on_button_toggled(toggled_on):
	pass

func _on_expand_idea_pressed2() -> void:
	pass
