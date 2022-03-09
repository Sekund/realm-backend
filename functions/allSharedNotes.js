exports = async function (arg) {
	var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
	var userId = context.user.custom_data._id || (await context.functions.execute("getCustomUserDataId"));

	// notes that other users are sharing with this user
	var allSharedNotes = await notes.aggregate([{ $match: { "sharing.peoples": BSON.ObjectId(userId) } }, { $lookup: { from: "users", localField: "sharing.peoples", foreignField: "_id", as: "sharing.peoples" } }, { $lookup: { from: "groups", localField: "sharing.groups", foreignField: "_id", as: "sharing.groups" } }]);

	allSharedNotes = await allSharedNotes.toArray();

	allSharedNotes = allSharedNotes.map((note) => {
		if (note.stats && note.stats.read) {
			if (note.stats.read[userId]) {
				note.isRead = note.stats.read[userId];
			}
		}
		return note;
	});

	return allSharedNotes;
};
