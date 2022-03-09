exports = async function (noteId, name, path) {
	var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
	const userId = context.user.custom_data._id || (await context.functions.execute("getCustomUserDataId"));

	const previousNote = await notes.findOne({ _id: noteId });
	if (!context.functions.execute("isOwnNote", previousNote, userId)) {
		return null;
	}
	const previousNotePath = previousNote.path;
	console.log("the previous path of the note is " + previousNotePath);

	const updateResult = await notes.updateOne({ _id: noteId }, { $set: { ["stats.read." + userId]: Date.now(), title: name, path } });

	const updtNote = await context.functions.execute("getNote", noteId.toString());

	let noteUsers = await context.functions.execute("getNoteUsers", updtNote);

	await context.functions.execute("notifyUsers", noteUsers, "note.rename", Date.now(), { ...updtNote, previousPath: previousNotePath });

	return updateResult;
};
