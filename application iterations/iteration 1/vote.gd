extends PanelContainer

#Sets slider variables (each representing a different category of voting)
@onready var slider1 = $MarginContainer/Panel/HBoxContainer/VSlider1
@onready var slider2 = $MarginContainer/Panel/HBoxContainer/VSlider2
var val1 = 1
var val2 = 1

func _ready():	
	#Initializes score
	_update_score()

func _update_score(_value=0):  # Parameter is ignored but needed for signal
	#Prints the product of both sliders to showcase the value of the problem/solution
	print("Item score: ", val1 * val2+1)

func _on_v_slider_1_value_changed(value1: float) -> void:
	#Updates slider 1 value
	val1 = value1/10
	_update_score()


func _on_v_slider_2_value_changed(value2: float) -> void:
	#Updates slider 2 value
	val2 = value2/10
	_update_score()
