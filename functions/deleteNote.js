exports = async function (noteId) {
	var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");

	let note = await notes.findOne({ _id: noteId });
	if (!context.functions.execute("isOwnNote", note, userId)) {
		return null;
	}

	if (note.assets && note.assets.length > 0) {
		note.assets.forEach((asset) => {
			context.functions.execute("removeAsset", `${note.userId}/${noteId.toString()}/${asset}`);
		});
	}

	let noteUsers = await context.functions.execute("getNoteUsers", note);

	const deleteResult = await notes.deleteOne({ _id: noteId });

	await context.functions.execute("notifyUsers", noteUsers, "note.delete", Date.now(), note);

	return deleteResult;
};
