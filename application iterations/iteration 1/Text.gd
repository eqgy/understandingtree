extends LineEdit
class_name Text  # Make it reusable

var input_text: String = ""  # Stores the current text

func _ready():
	grab_focus()  # Auto-focus when created
	call_deferred("set_caret_column", len(text))  # Ensure caret starts at the end
	text_changed.connect(_on_text_changed)
	set_blinking(true)  # Enable blinking cursor

func _on_text_changed(new_text: String):
	input_text = new_text  # Store the text
	print("Current input: ", input_text)  # Debugging

# Function to enable cursor blinking
func set_blinking(enabled: bool):
	caret_blink = enabled  # Enable or disable blinking
	caret_blink_interval = 0.5  # Adjust blink speed (default: 0.5 seconds)
