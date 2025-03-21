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
	var filename = "export1.txt"
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
	data = $node.export()
	save_to_file(data)
	pass # Replace with function body.


func _on_import_pressed():
	pass # Replace with function body.


func _on_file_dialog_file_selected(path):
	var globalpos
	for child in get_children():
		if !(child.name == ("export")) and !(child.name == ("import")):
			globalpos = child.global_position
			child.queue_free()
	var file = FileAccess.open(path, FileAccess.READ)
	var content = file.get_as_text()
	#print(content)
	
	#first node
	content = content.strip_escapes()
	var content_array = content.split("|")

	var p = content_array[2]
	var s = content_array[3]

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
	child.import_sequence(p,s)
	content_array.remove_at(0)
	content_array.remove_at(0)
	content_array.remove_at(0)
	content_array.remove_at(0)
	
	#subsequent nodes
	while(!(content_array.is_empty())):
		p = content_array[1]
		s = content_array[2]
		nodeparent = int(content_array[0].substr(0,1))
		nodeid= int(content_array[0].substr(2,1))
		nodetype = int(content_array[0].substr(4,1))
		print(content_array[0])
		child = load("res://a node.tscn").instantiate()
		child.type = nodetype
		print(nodeparent)
		print(Globals.nodedictionary)
		var par = Globals.nodedictionary[nodeparent]
		par.add_child(child)
		await child.ready
		print("nodecount" + str(Globals.nodecount))
		child.add_line()
		child.solution_leaf.visible = true
		child.problem_leaf.visible = true
		child.import_sequence(p,s)
		content_array.remove_at(0)
		content_array.remove_at(0)
		content_array.remove_at(0)
