extends PanelContainer

@onready var menu = $MarginContainer/HBoxContainer/VBoxContainer
@onready var panel = $MarginContainer/Panel

func _ready():
	menu.visible = true
	panel.visible = true	

func _on_button_pressed():
	var wasClosed = menu.visible == false
	panel.visible = wasClosed
	menu.visible = wasClosed
