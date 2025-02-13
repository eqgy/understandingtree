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
# Called when the node enters the scene tree for the first time.
func _ready():
	connect("problem_or_solution", _on_expand_pressed2)

func add_line():
	if parent == null:
		if stop <= 30:
			stop += 1
			parent = get_parent()
			if parent == null:
				pass
			else:
				parent = parent.get_parent()
	if parent != null:
		if has_line == false:
			if parent is Node2D && "too" in parent:
				var line = Line2D.new()
				line.add_point(Vector2(0,0)) #add a point at its initital position
				#line.add_point(-position)
				line.add_point(-(global_position-parent.global_position))
				line.z_index=-1
				add_child(line)
			has_line = true

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if stop <=30:
		add_line()
	pass

func _on_addbranch_pressed():
	var child = load("res://a node.tscn").instantiate()
	var position_offset = Vector2(400*children, 20*children)
	child.position = position_offset
	child.add_line()
	children += 1
	$title2.add_child(child)
	print(children)
	pass # Replace with function body.

func _on_expand_pressed2(arg):
	var child = load("res://a node.tscn").instantiate()
	var off_set_weight
	if arg == 1:
		off_set_weight = problems
	else:
		off_set_weight = solutions
	var position_offset = Vector2(400, arg*100 + 200*off_set_weight*arg) #100 is the length of the button
	child.position = position_offset
	#child.position.y += 100*children
	#child.position.x  += 400 
	child.add_line()
	if arg == 1: #if it is a problem add the child to title2
		$title2.add_child(child)
		problems +=1
	else: #If it is a solution add the child to title
		$title.add_child(child)
		solutions +=1
	print(children)

#DIVERING BRANCH FUNCTIONS
func problem_diverge():
	var child = load("res://a node.tscn").instantiate()
	var position_offset = Vector2(-90, 300 + 200*prob_diverges)
	child.position = position_offset
	child.add_line()
	$title2.add_child(child)
	prob_diverges +=1
	
func solution_diverge():
	var child = load("res://a node.tscn").instantiate()
	var position_offset = Vector2(-90, -300 -200*solution_diverges)
	child.position = position_offset
	child.add_line()
	$title.add_child(child)
	solution_diverges +=1
	
func problem_expand():
	emit_signal("problem_or_solution", 1)
	
func solution_expand():
	emit_signal("problem_or_solution", -1)
	
func _on_button_toggled(toggled_on):
	pass # Replace with function body.


func _on_expand_idea_pressed2() -> void:
	pass # Replace with function body.
