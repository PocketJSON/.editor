export class Matrix {
	// public ofObjects(object: Object) {
	// 	const matrix: Array<Object> = [];

	// 	for (const key in object) {
	// 		if (Object.prototype.hasOwnProperty.call(object, key)) {
	// 			matrix.push({ [key]: object[key as keyof Object] });
	// 		}
	// 	}

	// 	return matrix;
	// }

	public ofArrays(object: Object) {
		const matrix: Array<string[]> = [];

		for (const key in object) {
			if (Object.prototype.hasOwnProperty.call(object, key)) {
				matrix.push([key, object[key as keyof object]]);
			}
		}

		return matrix;
	}
}
