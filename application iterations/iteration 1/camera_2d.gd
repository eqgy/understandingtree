extends Camera2D

var move_direction: Vector2
var speed = 4
var zoomingfactor = Vector2(1,1)
var zoom_step = 1.1
var go = false

func _input(event):
	if event is InputEventMouse:
		if event.is_pressed() and not event.is_echo():
			var mouse_position = event.position
			if event.button_index == MOUSE_BUTTON_WHEEL_UP:
				zoom_at_point(zoom_step,mouse_position)
			if event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
				zoom_at_point(1/zoom_step,mouse_position)
			if event.button_index == MOUSE_BUTTON_LEFT:
				go = true
		
		if (event is InputEventMouseButton && event.is_pressed() == false):
			if event.button_index == MOUSE_BUTTON_LEFT:
				go = false

			
	if event is InputEventMouseMotion:
		if go:
			var mult = Vector2(1/zoomingfactor[0], 1/zoomingfactor[1])
			position -= event.screen_relative * (mult) #move less if you are zoomed in
				
func zoom_at_point(zoom_change, point):
	var c0 = global_position # camera position
	var v0 = get_viewport().size # vieport size
	var c1 # next camera position
	var z0 = zoom # current zoom value
	var z1 = z0 * zoom_change # next zoom value
	zoomingfactor = zoom
	c1 = c0 + (-0.5*v0 + point)*(z0 - z1)
	zoom = z1
	global_position = c1


func _ready():
	pass # Replace with function body.
func _process(delta):
	move_direction.x = int(Input.is_action_pressed("right")) - int(Input.is_action_pressed("left"))
	move_direction.y = int(Input.is_action_pressed("down")) - int(Input.is_action_pressed("up"))
	var motion = move_direction.normalized()
	position += speed * motion
	pass
