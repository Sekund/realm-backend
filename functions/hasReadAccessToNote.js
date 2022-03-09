exports = function (note, userId) {
	if (note.userId.toString() === userId) {
		return true;
	}
	for (let i = 0; i < note.sharing.peoples.length; i++) {
		const p = note.sharing.peoples[i];
		if (p._id && p._id.toString() === userId) {
			return true;
		} else if (p.toString() === userId) {
			return true;
		}
	}
	for (let i = 0; i < note.sharing.groups.length; i++) {
		const g = note.sharing.groups[i];
		for (let j = 0; j < g.peoples.length; j++) {
			const gp = g.peoples[j];
			if (gp.toString() === userId) {
				return true;
			}
		}
	}
	return false;
};
