exports = async function (noteId, peopleId) {
	const notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
	const userId = context.user.custom_data._id || (await context.functions.execute("getCustomUserDataId"));

	// CAUTION here, we are retrieving the note *before* the update
	// so the notifyNoteUsers function will be able to find affected users
	const oldNote = await notes.findOne({ _id: noteId });
	if (!context.functions.execute("isOwnNote", oldNote, userId)) {
		return null;
	}
	let noteUsers = await context.functions.execute("getNoteUsers", oldNote);

	await notes.updateOne({ _id: noteId }, { $set: { ["stats.read." + userId]: Date.now() }, $pull: { "sharing.peoples": { $in: [peopleId] } } });

	await context.functions.execute("notifyUsers", noteUsers, "modifySharingPeoples", Date.now(), { noteId });

	return {};
};
