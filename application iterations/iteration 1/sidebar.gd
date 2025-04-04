extends PanelContainer

@onready var menu = $MarginContainer/HBoxContainer/VBoxContainer
@onready var panel = $MarginContainer/Panel
signal airun

func _ready():
	menu.visible = true
	panel.visible = true	

func _on_button_pressed():
	var wasClosed = menu.visible == false
	panel.visible = wasClosed
	menu.visible = wasClosed


func _on_ai_pressed():
	var output = []
	var path = "res://data/mouse in the house.txt"
	var file = FileAccess.open(path, FileAccess.READ)
	var content = file.get_as_text().strip_escapes()
	var cmd = "ollama run deepseek-r1 " + "'the following content is data from a file. each line of the data contains information about a node. Each node contains a problem and solution, and the data of these problems and solutions is denoted by [p] and [s], respectively. These nodes form a tree, the understanding tree. the first number is the id of the parent node, the second is the id of the note, and the third is the type of node as it relates to the parent node (0 is that it is the first node in the sequence, 1 is that it is the expansion of a problem, 2 is that it is the expansion of a solution, 3 is the diverging of a problem, 4 is the diverging of a solution, and 5 is a counterargument of the previous node). ids, problems and solutions are seperated via this character: |. do you understand the file? respond w a yes or no"+ content + "'"
	print(cmd)
	var exit_code = OS.execute("cmd.exe", ["/c", "cmd"], output)
	print(output)
