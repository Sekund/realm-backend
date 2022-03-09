exports = async function (noteId) {
	const notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
	const userId = context.user.custom_data._id || (await context.functions.execute("getCustomUserDataId"));

	let note = await context.functions.execute("getNote", noteId.toString());
	if (!context.functions.execute("hasReadAccessToNote", note, userId)) {
		return null;
	}

	const stats = note.stats || { read: {} };
	let readCount = note.readCount || 0;

	if (note.userId.toString() !== userId && !stats.read[userId]) {
		readCount += 1;
	}

	stats.read[userId] = Date.now();

	await notes.updateOne({ _id: noteId }, { $set: { stats, readCount } });

	// TODO: notify author with updated readcount

	return "OK";
};
