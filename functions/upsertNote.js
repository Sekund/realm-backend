exports = async function (note) {
	const notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
	const userId = context.user.custom_data._id || (await context.functions.execute("getCustomUserDataId"));

	const existingNote = await notes.findOne({ path: note.path });
	const now = Date.now();

	if (existingNote) {
		if (!context.functions.execute("isOwnNote", existingNote, userId)) {
			return null;
		}
		notes.updateOne(
			{ path: note.path },
			{
				$set: {
					...note,
					["stats.read." + userId]: Date.now(),
					lastPublished: now,
				},
			}
		);
		const updtNote = await notes.findOne({ _id: existingNote._id });
		context.functions.execute("notifyNoteUsers", updtNote, "updateNote", now, { noteId: existingNote._id });
	} else {
		notes.insertOne({
			...note,
			userId: BSON.ObjectId(userId),
			comments: [],
			sharing: { peoples: [], groups: [] },
			firstPublished: now,
			lastPublished: now,
		});
	}

	return note;
};
