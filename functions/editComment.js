exports = async function (noteId, comment, created, updated) {
	var userId = context.user.custom_data._id || (await context.functions.execute("getCustomUserDataId"));
	var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");

	const updateTime = Date.now();

	let note = await context.functions.execute("getNote", noteId.toString());
	if (!context.functions.execute("hasReadAccessToNote", note, userId)) {
		return null;
	}
	var updtComments = [];

	for (var i = 0; i < note.comments.length; i++) {
		const currentComment = note.comments[i];

		if (currentComment.updated === updated && currentComment.created === created) {
			currentComment.updated = Date.now();
			currentComment.text = comment;
		}
		updtComments.push(currentComment);
	}

	await notes.updateOne({ _id: note._id }, { $set: { ["stats.read." + userId]: Date.now(), comments: updtComments } });
	const updatedNote = await context.functions.execute("getNote", noteId.toString());
	context.functions.execute("notifyNoteUsers", updatedNote, "note.editComment", updateTime);

	return updatedNote;
};
