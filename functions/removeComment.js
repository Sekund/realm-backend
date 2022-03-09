exports = async function (noteId, created, updated) {
	var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
	const userId = context.user.custom_data._id || (await context.functions.execute("getCustomUserDataId"));

	let note = await context.functions.execute("getNote", noteId.toString());
	if (!context.functions.execute("hasReadAccessToNote", note, userId)) {
		return null;
	}

	const updateTime = Date.now();

	await notes.updateOne({ _id: noteId }, { $set: { ["stats.read." + userId]: updateTime + 1, updated: updateTime }, $pull: { comments: { created: "" + created, updated: "" + updated } } });
	await notes.updateOne({ _id: noteId }, { $set: { ["stats.read." + userId]: updateTime + 1, updated: updateTime }, $pull: { comments: { created: created, updated: updated } } });

	note = await context.functions.execute("getNote", noteId.toString());
	context.functions.execute("notifyNoteUsers", note, "note.removeComment", updateTime);

	return "done";
};
