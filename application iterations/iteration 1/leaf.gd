extends Button


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func _input(event):
	if button_pressed == true:
		if event is InputEventMouseButton and event.pressed:
			await get_tree().create_timer(.5).timeout
			emit_signal("toggled", button_pressed)
			button_pressed = false
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass

	
	
