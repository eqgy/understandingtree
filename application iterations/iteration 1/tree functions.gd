extends Node2D

var data
# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
	

func save_to_file(content):
	var path = "res://data/"
	var filename = "export1.utree"
	var dirAccess = DirAccess.open("user://")
	if dirAccess == null:
		print("DirAccess is null");
	else:
		dirAccess.make_dir(path)
		
	var file = FileAccess.open(path + filename, FileAccess.WRITE)
	if file == null:
		print("cannot open file to save")
	
	print(ProjectSettings.globalize_path(path))
	print(FileAccess.get_open_error())
	print(content)
	print(file)
	file.store_string(content)

	file.close()

func _on_export_pressed():
	#runs the export function of children, and then saves data to file.
	var stop = false
	for child in get_children():
		if !stop && "problems" in child:
			data = child.export()
			stop = true
			break;
	if data != "":
		save_to_file(data)


func _on_import_pressed():
	pass # Replace with function body.


func _on_file_dialog_file_selected(path):
	#IMPORT SEQUNECE: 2 
	var globalpos
	for child in get_children():
		if !(child.name == ("export")) and !(child.name == ("import")):
			globalpos = child.global_position
			child.queue_free()
			Globals.nodecount = 1
			Globals.nodedictionary = {}
			
	#IMPORT SEQUENCE: 3 The selected file is read if it is valid. 
	var file = FileAccess.open(path, FileAccess.READ)
	var content = file.get_as_text()
	#print(content)
	
	#first node
	
	
	#IMPORT SEQUNECE: 4 The file has all escape characters removed, and the remaining text is split based on the “|” character 
	content = content.strip_escapes()
	var content_array = content.split("|")
	
	var p = content_array[2]
	var s = content_array[3]


	#IMPORT SEQUENCE: 5 The import function creates the first node, setting all text data to be the corresponding node object’s data, and instantiates it as a node. 
	var nodeparent : int = int(content_array[1].substr(0,1))
	var nodeid : int = int(content_array[1].substr(2,1))
	var nodetype : int = int(content_array[1].substr(4,1))
	
	var child = load("res://a node.tscn").instantiate()
	child.type = 0
	child.global_position = globalpos
	add_child(child)
	child.add_line()
	child.solution_leaf.visible = true
	child.problem_leaf.visible = true
	#child.import_sequence(p,s)
	
	
	#IMPORT SEQUENCE: 6 The import function forgets the data it just utilized. 
	content_array.remove_at(0)
	content_array.remove_at(0)
	content_array.remove_at(0)
	content_array.remove_at(0)
	
	
	#IMPORT SEQUENCE: 7 The remaining data is parsed and organized based on the parent ID (this is imperative, to prevent the application from initializing a node before the parent exists. 
	var dic = {}
	while(!(content_array.is_empty())):
		var narray = content_array[0].split(" ")
		var nid = int(narray[1])
		dic[nid] = [content_array[0],content_array[1],content_array[2]]

		content_array.remove_at(0)
		content_array.remove_at(0)
		content_array.remove_at(0)

	
	#IMPORT SEQUENCE 8: From there, the program begins initializing nodes essentially pressing the corresponding buttons of the documented parent node.  
	#subsequent nodes
	var count = 2
	while(!(dic.is_empty())):
		var n = dic[count]
		p = n[1]
		s = n[2]
		var narray = n[0].split(" ")
		nodeparent = int(narray[0])
		nodeid= int(narray[1])
		nodetype = int(narray[2])
		count += 1
		var par = Globals.nodedictionary[nodeparent]
		var l = par.get_children().size()
		if nodetype == 1:#KEY: 0=origin node, 1= problem expand, 2= solution expand, 3= problem diverge, 4 = solution diverge, 5 = counter argument
			child = par.problem_expand()
			child.problem_leaf.visible = true
		elif nodetype == 2:
			child = par.solution_expand()

			child.solution_leaf.visible = true
		elif nodetype == 3:
			child = par.problem_diverge()
			child.solution_leaf.visible = true
		elif nodetype == 4:
			child = par.solution_diverge()
			child.problem_leaf.visible = true
		elif nodetype == 5: #
			child = par.problem_counterarg()
			child.solution_leaf.visible = true
			
		#IMPORT SEQUENCE 9: A frame is processed to ensure actions do not occur out of order. 
		await get_tree().process_frame


	#IMPORT SEQUENCE: 10 The initialized node is deleted from the dictionary, and the process is repeated on the subsequent node 
		child.import_sequence(p,s)
		print("count being erased" + str(count-1))
		dic.erase(count-1)
