extends Button

var text_retainer
# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func _input(event):
	if button_pressed == true:
		if event is InputEventMouseButton and event.pressed:
			await get_tree().create_timer(.1).timeout
			emit_signal("toggled", button_pressed)
			button_pressed = false
		if Input.is_action_pressed("enter"):
			text = $LineEdit.text
			$LineEdit.visible = false
			print('eneter
			')
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if button_pressed == true:
		text_retainer = text
		text = ""
	pass

	
	


func _on_pressed():
	if button_pressed == true:
		text_retainer = text
		text = ""
		$LineEdit.text = text_retainer
		$LineEdit.visible = true
	if button_pressed == false:
		
		$LineEdit.text = text
	pass # Replace with function body.
