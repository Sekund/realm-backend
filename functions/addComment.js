exports = async function (noteId, comment, author, updateTime) {
	var userId = context.user.custom_data._id || (await context.functions.execute("getCustomUserDataId"));
	var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
	var users = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("users");

	let note = await context.functions.execute("getNote", noteId.toString());
	if (!context.functions.execute("hasReadAccessToNote", note, userId)) {
		return null;
	}
	var authorUser = await users.findOne({ _id: new BSON.ObjectId(author) });
	const commentObject = { text: comment, author: authorUser, created: updateTime, updated: updateTime };

	const updatedNote = await notes.updateOne({ _id: noteId }, { $set: { updated: updateTime, ["stats.read." + userId]: Date.now() }, $push: { comments: commentObject } });

	note = await context.functions.execute("getNote", noteId.toString());
	context.functions.execute("notifyNoteUsers", note, "note.addComment", updateTime);

	return updatedNote;
};
