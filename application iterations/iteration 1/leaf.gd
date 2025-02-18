extends Button
var selected = false

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if selected == true:
		if Input.is_action_just_pressed("mouse_click"):
			await get_tree().create_timer(.05).timeout
			emit_signal("toggled")
			print("tried to toggle ")
		
	pass


func _on_toggled(toggled_on):
	selected = not selected
	print(selected)
