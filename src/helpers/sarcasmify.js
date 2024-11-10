export function sarcasmify(msg) {
	return msg
		.split("")
		.map((char) => (Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()))
		.join("");
}
