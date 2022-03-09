exports = async function (noteId, peopleId) {
	const notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
	const userId = context.user.custom_data._id || (await context.functions.execute("getCustomUserDataId"));

	let note = await notes.findOne({ _id: noteId });
	if (!context.functions.execute("isOwnNote", note, userId)) {
		return null;
	}

	await notes.updateOne({ _id: noteId }, { $set: { ["stats.read." + userId]: Date.now() }, $addToSet: { "sharing.peoples": peopleId } });
	const updtNote = await notes.findOne({ _id: noteId });

	context.functions.execute("notifyNoteUsers", updtNote, "modifySharingPeoples", Date.now(), { noteId });

	return {};
};
