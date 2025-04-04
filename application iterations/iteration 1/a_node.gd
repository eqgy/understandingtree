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
	
func adjust_ids(deleted_id):
	"""This function is called whenever a node is deleted. It takes the id of the deleted node as 
	an argument and decrements all of the subqequent id's by 1. 
	"""
	var id = deleted_id
	while (id < Globals.nodecount-1):
		Globals.nodedictionary[id] = Globals.nodedictionary[id+1]
	Globals.nodedictionary.erase(id+1)
	Globals.nodecount -=1
		

func import_sequence(s,p):
	problem_leaf.text = p
	solution_leaf.text = s
	if p == "":
		problem_leaf.visible = false
	else: 
		problem_leaf.visible = true
	if s == "":
		solution_leaf.visible = false
	else:
		solution_leaf.visible = true

func _ready():
	add_custom_line_edit_to_child(2)  # <-- Highlighted change
	id = Globals.nodecount
	Globals.nodedictionary[id] = self
	Globals.nodecount +=1

func adjust_diverge(parent, adjust):
	"""adjust_diverge changes the length of diverging branches to avoid collisions. It takes two arguments:
	parent and adjust. Parent is the divergnet node and adjust is a string indicating whether the divergent
	branch should move up or move down.
	"""
	var multiple
	if adjust == "yes": #Branch moves down
		multiple = 1
	else: #branch moves up
		multiple = -1
	if (parent.type == 3):
		var base_node = parent.get_parent()
		for c in base_node.get_children():
			if c.get_class() == "Node2D":
				if c.type == 3:
					if parent.global_position.y <= c.global_position.y:
						c.global_position.y += 150 * multiple
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
						c.global_position.y += 150 * multiple
						for c2 in c.get_children():
							if c2.get_class() == "Line2D" || c2.get_class() == "Area2D":
								c2.queue_free()
								continue;
						c.has_line = false;
						c.add_line()

func search_for_divergent(obj):
	"""This function recursively searches for and returns the most recent divergnet node. It takes 
	the collided node as an argument.
	"""
	if obj.get_class() != "Node2D":
		obj = obj.get_parent()
	#If it is a divergent node, return it
	if obj.type == 3:
		return obj
	elif obj.type == 4:
		return obj
		
	#stop if it's the base node
	elif obj.type == 0:
		return obj
	else:
		var returned = search_for_divergent(obj.get_parent())
		if returned == null || returned.type == 0 ||  returned.get_class() != "Node2D": #if the node isn't a divergent node, return null
			return null
		return returned
		
func check_collisions():
	"""This fuction checks if any collisions have occured. If one has, it calls other functions to 
	handle it accodingly.
	"""
	for c in get_children():
		if c.get_class() == "Area2D":
			if c.has_overlapping_areas():
				print("collided!!")
				
				var adjust = "invalid"
				#check for a divergent node
				var collisions = c.get_overlapping_areas()
				var parent = c.get_parent()
				var position = collisions[0].position.y
				#Only adjust if it is a divergent branch or an expansion branch. Currently these are the only adjustment capabilities implemented
				"""if (parent.type == 4 || parent.type == 3):
					if parent.position.y """
				if parent.type == 2 || parent.type == 4:
					adjust = "yes"
				elif parent.type == 1 || parent.type ==3:
					adjust = "no"
				if adjust == "invalid":
					return;
				#Adjustments occur by changing the size of divergent brnaches. Check for the most recent divergent branch
				var diverge = search_for_divergent(self)
				if diverge == null:
					return
				else: #If there is a divergent branch, adjust it
					adjust_diverge(diverge, adjust)
				
func add_collision(posx, posy):
	"""add_collision is used to create new collision boxes around branch lines. It takes two arguments:
	the x and y coordinates of the new node's position. 
	"""
	#creating shape
	var angle = + 4.712 + atan(posy/posx) #Find the angle based on the y and x position.  4.712 = 2 PI
	var length = pow((pow(posy,2) + pow(posx,2)), 0.5) #Find the length of the line
	var shape = RectangleShape2D.new() 
	shape.size = Vector2(15,length) #15 is the width of the line
	
	#Create collision shape
	var collision_shape = CollisionShape2D.new()
	collision_shape.shape = shape
	collision_shape.rotation = angle
	var area = Area2D.new()
	area.set_collision_mask_value(1, true) #Set the collision mask layers
	area.add_child(collision_shape)
	
	#repositioning
	area.position.x = posx/2
	area.position.y = posy/2
	add_child(area)

	
func add_line():
	"""This function is used to connect new nodes to their parents. 
	"""
	if parent == null: 
		#Find the parent node that is a node2D. This node is either 1 or 2 parents away.
		if stop <= 30:
			stop += 1
			parent = get_parent()
			if parent == null || parent is Node2D:
				pass
			else:
				parent = parent.get_parent()
	if parent != null:
		if has_line == false: #Make sure the node doesn't already have a line
			if parent is Node2D && "too" in parent:
				var line = Line2D.new()
				line.add_point(Vector2(0,0)) # Add a point at its initial position
				var new_x = -position.x
				if type == 1 || type == 2:
					new_x = -(position.x-150) #If the branch is being expanded, ensure that the line is centered on the button
				var new_y = -position.y
				var new_pos = Vector2(new_x, new_y)
				line.add_point(new_pos)
				line.z_index = -1 #Make the line underneath the other nodes. 
				add_child(line)
				if type == 1 || type ==2: #If it's an expansion, add a collision box
					add_collision(new_x,new_y)
			has_line = true
			
func _process(delta):
	check_collisions()
	if stop <= 30:
		add_line()
	

func problem_counterarg():
	"""problem_counterarg() is called whenever the "counter" button on a problem leaf is pressed. 
	This function behaves almost exactly the same as solution_counterarg. If the node's solution leaf
	is invisible, it makes it visible. Otherwise, a 0 degree line off of the previous node is formed
	and a new solution leaf branches off of it. 
	"""
	var done = false
	var par = self
	#First, check if the solution leaf is invisible, if it is it is made visible and the function terminates.
	if !solution_leaf.visible:
		solution_leaf.visible = true
	else:
		#Move through each counterarg node, stop once you find one without a counterargument node branching off of it
		while (par.has_counterarg && !done):
			for c in par.get_children():
				if "problems" in c && c.type == 5:
					par = c
					if !c.solution_leaf.visible: #if the solution leaf is invisible, make it visible and you are done
						c.solution_leaf.visible = true
						done = true
						break
		if !done:  #New counterarg node needs to be added as  a child to the furthest one out
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
	return self

func solution_counterarg():
	"""solution_counterarg() is called whenever the "counter" button on a solution leaf is pressed. If
	the node's problem leaf is invisible, it makes it visible. Otherwise, a 0 degree line off of the previous
	node is formed and a new problem leaf branches off of it. 
	"""
	var par = self
	var done = false
	#First, check if the problem leaf is invisible, if it is it is made visible and the function terminates.
	if !problem_leaf.visible:
		problem_leaf.visible = true
	else:
		#Move through each counterarg node, stop once you find one without a counterargument node branching off of it
		while (par.has_counterarg && !done):
			for c in par.get_children():
				if "problems" in c && c.type == 5:
					par = c
					if !c.problem_leaf.visible:  #if the problem leaf is invisible, make it visible and you are done
						c.problem_leaf.visible = true
						done = true
						break
		if !done: #New counterarg node needs to be added as  a child to the furthest one out
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
	return self

func problem_diverge():
	"""problem_diverge() is called whenever the "diverge" button on a problem leaf is pressed. It
	functions almost exactly the same as solution_diverge(). It creates a new node shooting down off 
	of the previous one at a 90 degree angle. 
	"""
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
	"""solution_diverge() is called whenever the "diverge" button on a solution leaf is pressed.
	It creates a new node shooting up off of the previous one at a 90 degree angle. 
	"""
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

func problem_expand():
	"""problem_expand is called whenever the "expand" button on a problem leaf is pressed. It functions
	almost exactly the same as solution_expand. It creates a new node going downward at about 30 degrees 
	from the problem leaf. 
	"""
	var child = load("res://a node.tscn").instantiate()
	var off_set_weight
	off_set_weight = problems
	var position_offset = Vector2(450, 200) 
	child.position = position_offset
	child.add_line()
	
	#Recursively determine the furthest expand node from the current one
	if (problems != 0):
		var expand_parent = self
		for c in $problem.get_children():
			if "problems" in c:
				expand_parent = c
		child = expand_parent.problem_expand()
			
	else: #Base case: the node doesn't have any expansions off of it
		problem_leaf.add_child(child)
		problems+= 1
		child.get_node("solution").visible = false
		child.type = 1
	return child

func solution_expand():
	"""solution_expand is called whenever the "expand" button on a solution leaf is pressed. It creates a new node 
	going upward at about 30 degrees from the solution leaf. 
	"""
	var child = load("res://a node.tscn").instantiate()
	var off_set_weight
	off_set_weight = solutions
	var position_offset = Vector2(450, -200) #Arg will change the direction that the node spawns in
	child.position = position_offset
	child.add_line()
	
	#Recursively determine the furthest expand node from the current one
	if (solutions != 0):
		var expand_parent = self
		print("reoccurred")
		for c in $solution.get_children():
			if "problems" in c:
				expand_parent = c
		child = expand_parent.solution_expand()
	else: #Base case: the node doesn't have any expansions off of it
		solution_leaf.add_child(child)
		solutions += 1
		child.get_node("problem").visible = false 
		child.type = 2
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
	"""This function is called whenever the delete button of a solution leaf is pressed. Based on the
	 type of the node and whether the node has a problem, different behavior occur. This function behaves
	almost the exact same way as _on_problem_delete_pressed()"""
	parent = get_parent() #Get the parent of the node
	if type == 0:
		print("this is the base node. You cannot delete it.") 
		return
	
	"""For each, if the problem isn't visible, delete the entire node and update the parent node's counts
	accordingly
	"""
	if type == 1:
		parent = parent.get_parent()
		if (!$problem.visible):
			parent.problems -=1 #remove the solution
		
	elif type == 2:
		parent = parent.get_parent()
		if (!$problem.visible):
			parent.solutions -=1 #remove the solution
	
	elif type == 3:
		if (!$problem.visible):
			parent.problem_diverges -=1
			#If a diverge is deleted, adjust by moving each node above it downwards
			for c in parent.get_children():
				if "problems" in c && c.type == 3:
					if global_position.y < c.global_position.y:
						c.global_position.y += -400
						#delete lines and areas to be resized later
						for c2 in c.get_children():
							if c2.get_class() == "Line2D" ||  c2.get_class() == "Area2D":
								c2.queue_free()
								continue;
						c.has_line = false;
						c.add_line()
		
	elif type == 4:
		if (!$problem.visible):
			parent.solution_diverges -=1
			#If a diverge is deleted, adjust by moving each node above it downwards
			for c in parent.get_children():
				if "problems" in c && c.type == 4:
					if global_position.y > c.global_position.y:
						c.global_position.y += 400
						#delete lines and areas to be resized later
						for c2 in c.get_children():
							if c2.get_class() == "Line2D" ||  c2.get_class() == "Area2D":
								c2.queue_free()
								continue;
						c.has_line = false;
						c.add_line()
	elif type ==5:
		parent.has_counterarg = false;
	for child in $solution.get_children():
		if (child.get_class() == "Node2D"): #No matter what delete all of the child nodes off of the node
			child.queue_free()
	if $solution.visible:
		$solution.visible = false
	if $problem.visible == false:
		for child in $solution.get_children(): #if the problem isn't visible, delete the entirety of the node
			child.queue_free()
		adjust_ids(id) #ensure that the id's of the subsequent nodes are adjusted
		queue_free()
	

func _on_problem_delete_pressed() -> void:
	"""This function is called whenever the delete button of a problem leaf is pressed. Based on the
	 type of the node and whether the node has a solution, different behavior occur"""
	parent = get_parent()
	if type == 0: #The first node cannot be deleted
		print("this is the base node. You cannot delete it.")
		return
	"""For each, if the solution isn't visible, delete the entire node and update the parent node's counts
	accordingly
	"""
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
			#If a diverge is deleted, adjust by moving each node above it downwards
			for c in parent.get_children():
				if "problems" in c && c.type == 3:
					if global_position.y < c.global_position.y:
						c.global_position.y += -400 #400 is the length of one diverge branch
						for c2 in c.get_children(): #Adjust all children as well
							#delete lines and areas to be resized later
							if c2.get_class() == "Line2D" || c2.get_class() == "Area2D":
								c2.queue_free()
								continue;
						c.has_line = false;
						c.add_line() #Add a new line
		
	elif type == 4:
		if (!$solution.visible):
			parent.prob_diverges -=1
			for c in parent.get_children():
				#If a diverge is deleted, adjust by moving each node above it downwards
				if "problems" in c && c.type == 4:
					if global_position.y > c.global_position.y:
						c.global_position.y += 400 #400 is the length of one diverge branch
						for c2 in c.get_children(): #Adjust all children as well
							#delete lines and areas to be resized later
							if c2.get_class() == "Line2D" || c2.get_class() == "Area2D":
								c2.queue_free()
								continue;
						c.has_line = false;
						c.add_line()
	elif type ==5:
		parent.has_counterarg = false;
			
	for child in $problem.get_children(): #Delete all of the node's children
		if (child.get_class() == "Node2D"): #No matter what delete all of the child nodes off of the node
			child.queue_free()

	if $problem.visible:
		$problem.visible = false
	if $solution.visible == false: #If the solution isn't visible, delete the node's other children
		for child in $problem.get_children():
			child.queue_free()
		adjust_ids(id) #ensure that the id's of the subsequent nodes are adjusted
		queue_free()

func export()-> String:
	if (visible):
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
	return ""
