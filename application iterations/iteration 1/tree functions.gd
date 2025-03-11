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
	data = $node1.export()
	save_to_file(data)
	pass # Replace with function body.


func _on_import_pressed():
	pass # Replace with function body.
