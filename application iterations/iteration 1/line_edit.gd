extends LineEdit

var cooldownrunning
# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if Input.is_action_just_pressed("enter"):
		release_focus()
		get_parent().text = text
		visible = false
	if Input.is_action_just_pressed("click") && cooldownrunning == false:
		visible = false
		get_parent().text = text
		release_focus()

func cooldown():
	cooldownrunning = true
	await get_tree().create_timer(.5).timeout
	cooldownrunning = false
