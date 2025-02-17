extends Node2D

# The LineEdit node
@onready var line_edit: LineEdit = $LineEdit

# The String variable to store the text value
var text_value: String = ""

func _ready():
	# Connect the LineEdit's text_changed signal to update the text_value
	line_edit.text_changed.connect(_on_line_edit_text_changed)

# When the LineEdit text changes, update the text_value
func _on_line_edit_text_changed(new_text: String):
	text_value = new_text
	print("Text updated: ", text_value)

# Function to set the initial text
func set_initial_text(text: String):
	line_edit.text = text
	text_value = text

# Function to get the current text
func get_text() -> String:
	return text_value
