extends Node2D

var children = 0
@onready var problem_leaf = $problem
@onready var solution_leaf =$solution
var problems = 0
var solutions = 0
var stop = 0
var too = "A NODE"
var has_line = false
var prob_diverges = 0
var solution_diverges = 0
var installationdata
var type = 0 #KEY: 0=origin node, 1= problem expand, 2= solution expand, 3= problem diverge, 4 = solution diverge, 5 = counter argument
var id #set by globalcount function, for export identification
var has_counterarg = false
var dictionaryupdated = false

@onready var parent


func globalcount():
	id = Globals.nodecount
	Globals.nodedictionary[1] = self
	Globals.nodecount +=1
	

func import_sequence(p,s):
	problem_leaf.text = p
	solution_leaf.text = s
	if p == "":
		problem_leaf.visible = true
	else: 
		problem_leaf.visible = true
		
	if s == "":
		solution_leaf.visible = true
	else: 
		solution_leaf.visible = true

func _ready():
	add_custom_line_edit_to_child(2)  # <-- Highlighted change
	id = Globals.nodecount
	Globals.nodedictionary[id] = self
	Globals.nodecount +=1

func adjust_diverge(parent):
	if (parent.type == 3):
		var base_node = parent.get_parent()
		for c in base_node.get_children():
			if c.get_class() == "Node2D":
				if c.type == 3:
					if parent.global_position.y <= c.global_position.y:
						c.global_position.y += 200
						for c2 in c.get_children():
							if c2.get_class() == "Line2D" || c2.get_class() == "Area2D":
								c2.queue_free()
								continue;
						c.has_line = false;
						c.add_line()

	elif (parent.type ==4):
		var base_node = parent.get_parent()
		for c in base_node.get_children():
			if c.get_class() == "Node2D":
				if c.type == 4:
					if parent.global_position.y >= c.global_position.y:
						c.global_position.y += -100
						for c2 in c.get_children():
							if c2.get_class() == "Line2D" || c2.get_class() == "Area2D":
								c2.queue_free()
								continue;
						c.has_line = false;
						c.add_line()

func search_for_divergent(obj):
	if obj.get_class() != "Node2D":
		obj = obj.get_parent()
	if obj.type == 3:
		return obj
	elif obj.type == 4:
		return obj
	elif obj.type == 0:
		return obj
	else:
		var returned = search_for_divergent(obj.get_parent())
		if returned == null || returned.type == 0 ||  returned.get_class() != "Node2D":
			return null
		return returned
		
func check_collisions():
	for c in get_children():
		if c.get_class() == "Area2D":
			if c.has_overlapping_areas():
				#check for a divergent node
				var diverge = search_for_divergent(self)
				if diverge == null:
					return
				else:
					adjust_diverge(diverge)
				
func add_collision(posx, posy):
	#creating shape
	var angle = 4.712 + atan(posy/posx)
	var length = pow((pow(posy,2) + pow(posx,2)), 0.5)
	var shape = RectangleShape2D.new()
	shape.size = Vector2(15,length)
	
	var collision_shape = CollisionShape2D.new()
	collision_shape.shape = shape
	collision_shape.rotation = angle
	var area = Area2D.new()
	area.set_collision_mask_value(1, true)
	area.add_child(collision_shape)
	
	#repositioning
	area.position.x = posx/2
	area.position.y = posy/2
	add_child(area)

	
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
				if type == 1 || type ==2:
					add_collision(new_x,new_y)
			has_line = true
			
func _process(delta):
	check_collisions()
	if stop <= 30:
		add_line()
	

func problem_counterarg():
	var done = false
	var par = self
	if !solution_leaf.visible:
		solution_leaf.visible = true
	else:
		while (par.has_counterarg && !done):
			for c in par.get_children():
				if "problems" in c && c.type == 5:
					par = c
					if !c.solution_leaf.visible:
						c.solution_leaf.visible = true
						done = true
						break
		if !done:
			par.has_counterarg = true
			var child = load("res://a node.tscn").instantiate()
			child.type = 5
			var position_offset = Vector2(300, 0)
			child.position = position_offset
			par.add_child(child)
			child.add_line()
			child.solution_leaf.visible = true
			child.problem_leaf.visible = false
			return child
	return null

func solution_counterarg():
	var par = self
	var done = false
	if !problem_leaf.visible:
		problem_leaf.visible = true
	else:
		while (par.has_counterarg && !done):
			for c in par.get_children():
				if "problems" in c && c.type == 5:
					par = c
					if !c.problem_leaf.visible:
						c.problem_leaf.visible = true
						done = true
						break
		if !done:
			par.has_counterarg = true
			var child = load("res://a node.tscn").instantiate()
			child.type = 5
			var position_offset = Vector2(300, 0)
			child.position = position_offset
			par.add_child(child)
			child.add_line()
			child.solution_leaf.visible = false
			child.problem_leaf.visible = true
			return child
	return null

func problem_diverge():
	var child = load("res://a node.tscn").instantiate()
	var position_offset = Vector2(0, 400 * (prob_diverges+1)) #Diverge more if there were previous diverges
	child.position = position_offset
	child.add_line()
	add_child(child)
	prob_diverges += 1
	child.get_node("solution").visible = false
	child.type = 3
	# Add a CustomLineEdit to the child
	add_custom_line_edit_to_child(2) 
	return child

func solution_diverge():
	print("IM TRYING")
	var child = load("res://a node.tscn").instantiate()
	var position_offset = Vector2(0, -400 * (solution_diverges+1)) #diverge more if there were previous diverges
	child.position = position_offset
	child.add_line()
	add_child(child)
	solution_diverges += 1
	child.get_node("problem").visible = false
	child.type = 4
	
	# Add a CustomLineEdit to the child
	add_custom_line_edit_to_child(2) 
	return child

func problem_expand(): #_on_expand_pressed2 signal
		#Arg differs depending on if a solution or problem is being expanded. Arg = 1 if solution, Arg = -1 if problem
	var child = load("res://a node.tscn").instantiate()
	var off_set_weight
	off_set_weight = problems
	var position_offset = Vector2(450, 200) #Arg will change the direction that the node spawns in
	child.position = position_offset
	child.add_line()
	if (problems != 0):
		var expand_parent = self
		print("reoccurred")
		for c in $problem.get_children():
			if "problems" in c:
				expand_parent = c
		child = expand_parent.problem_expand()
			
	else:
		problem_leaf.add_child(child)
		problems+= 1
		child.get_node("solution").visible = false
		child.type = 1
	return child

func solution_expand():
	#Arg differs depending on if a solution or problem is being expanded. Arg = 1 if solution, Arg = -1 if problem
	var child = load("res://a node.tscn").instantiate()
	var off_set_weight
	off_set_weight = solutions
	var position_offset = Vector2(450, -200) #Arg will change the direction that the node spawns in
	child.position = position_offset
	child.add_line()
	if (solutions != 0):
		var expand_parent = self
		print("reoccurred")
		for c in $solution.get_children():
			if "problems" in c:
				expand_parent = c
		child = expand_parent.solution_expand()
	else:
		solution_leaf.add_child(child)
		solutions += 1
		child.get_node("problem").visible = false
		child.type = 2
		print("prereturn" + str(child))
	return child
	

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
	parent = get_parent() #Get the parent of the node
	var line_edit #stores the line edit variable of a node
	if type == 0:
		print("this is the base node. You cannot delete it.") 
		return
		
	if type == 1:
		parent = parent.get_parent()
		if (!$problem.visible):
			parent.problems -=1 #remove the solution
		
	elif type == 2:
		parent = parent.get_parent()
		if (!$problem.visible):
			parent.solutions -=1 
	
	elif type == 3:
		if (!$problem.visible):
			parent.problem_diverges -=1
			for c in parent.get_children():
				if "problems" in c && c.type == 3:
					if global_position.y < c.global_position.y:
						c.global_position.y += -400
						for c2 in c.get_children():
							if c2.get_class() == "Line2D":
								c2.queue_free()
								continue;
						c.has_line = false;
						c.add_line()
		
	elif type == 4:
		if (!$problem.visible):
			parent.solution_diverges -=1
			for c in parent.get_children():
				if "problems" in c && c.type == 4:
					if global_position.y > c.global_position.y:
						c.global_position.y += 400
						for c2 in c.get_children():
							if c2.get_class() == "Line2D":
								c2.queue_free()
								continue;
						c.has_line = false;
						c.add_line()
	elif type ==5:
		parent.has_counterarg = false;
	for child in $solution.get_children():
		if (child.get_class() == "LineEdit"):
			line_edit = child
		else:
			child.queue_free()
	if $solution.visible:
		$solution.visible = false
	if $problem.visible == false:
		line_edit.queue_free()
		queue_free()
	

func _on_problem_delete_pressed() -> void:
	parent = get_parent()
	var line_edit
	if type == 0:
		print("this is the base node. You cannot delete it.")
		return
	if type == 1:
		parent = parent.get_parent()
		if (!$solution.visible):
			parent.problems-=1
	elif type == 2:
		parent = parent.get_parent()
		if (!$solution.visible):
			parent.solutions-=1
	elif type == 3:
		if (!$solution.visible):
			parent.prob_diverges -=1
			for c in parent.get_children():
				if "problems" in c && c.type == 3:
					if global_position.y < c.global_position.y:
						c.global_position.y += -400
						for c2 in c.get_children():
							if c2.get_class() == "Line2D" || c2.get_class() == "Area2D":
								c2.queue_free()
								continue;
						c.has_line = false;
						c.add_line()
		
	elif type == 4:
		if (!$solution.visible):
			parent.prob_diverges -=1
			for c in parent.get_children():
				if "problems" in c && c.type == 4:
					if global_position.y > c.global_position.y:
						c.global_position.y += 400
						for c2 in c.get_children():
							if c2.get_class() == "Line2D" || c2.get_class() == "Area2D":
								c2.queue_free()
								continue;
						c.has_line = false;
						c.add_line()
	elif type ==5:
		parent.has_counterarg = false;
	for child in $problem.get_children():
		if (child.get_class() == "LineEdit"):
			line_edit = child
		else:
			child.queue_free()
	if $problem.visible:
		$problem.visible = false
	if $solution.visible == false:
		line_edit.queue_free()
		queue_free()

func export()-> String:
	installationdata = "|"
	if id > 1:
		if (type >= 3):
			installationdata += str(get_parent().id)
		else:
			installationdata += str(get_parent().get_parent().id)
	else:
		installationdata += str(0)
	var i = str(id)
	var t = str(type)
	installationdata += " " + i + " " + t
	var data = installationdata+ "|" + $solution.text + "|" + $problem.text + "\n"
	
	for c in problem_leaf.get_children():
		if "too" in c:
			data = data + c.export()
	for c in solution_leaf.get_children():
		if "too" in c:
			data = data + c.export()
	for c in get_children():
		if "too" in c:
			data = data + c.export()
	return data
