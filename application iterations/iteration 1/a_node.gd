extends Node2D

var children = 0
var stop = 0
var too = "A NODE"
var has_line = false
@onready var parent
# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func add_line():
	if parent == null:
		if stop <= 30:
			stop += 1
			parent = get_parent()
	if parent != null:
		if has_line == false:
			if parent is Node2D && "too" in parent:
				var line = Line2D.new()
				line.add_point(global_position)
				line.add_point(parent.global_position)
				add_child(line)
				
			has_line = true
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if stop <=30:
		add_line()
	pass

func _on_addbranch_pressed():
	var child = load("res://a node.tscn").instantiate()
	child.position.y += 100*children
	child.position.x  += 400
	child.add_line()
	children += 1
	add_child(child)
	print(children)
	pass # Replace with function body.
