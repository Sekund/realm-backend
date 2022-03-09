exports = function (note, userId) {
	return note.userId.toString() === userId;
};
