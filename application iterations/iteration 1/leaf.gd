extends Button

@onready var lineedit = $LineEdit
var text_retainer
# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func _input(event):
	if button_pressed == true:
		if event is InputEventMouseButton and event.pressed:
			await get_tree().create_timer(.4).timeout
			emit_signal("toggled", button_pressed)
			button_pressed = false

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if button_pressed == true:
		text_retainer = text
		text = ""
		#lineedit.visible = true
		
	if Input.is_action_just_pressed("enter"):
		if lineedit:
			print(lineedit.text)
			text = lineedit.text
			lineedit.visible = false

	
	


func _on_pressed():
	if button_pressed == true:
		text_retainer = text
		text = ""

	pass # Replace with function body.
