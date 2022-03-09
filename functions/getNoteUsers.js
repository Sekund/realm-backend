exports = async function (populatedNote) {
	const notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
	const userId = context.user.custom_data._id || (await context.functions.execute("getCustomUserDataId"));

	let note = await notes.findOne({ _id: populatedNote._id });

	var users = [];

	function usersContains(userId) {
		for (var i = 0; i < users.length; i++) {
			if (users[i].toString() === userId.toString()) {
				return true;
			}
		}
		return false;
	}

	if (note) {
		users.push(note.userId);
		if (note.sharing && note.sharing.peoples) {
			users = users.concat(note.sharing.peoples);
		}
		if (note.sharing && note.sharing.groups) {
			const noteGroups = note.sharing.groups;
			if (noteGroups.length > 0) {
				const groups = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("groups");
				for (var i = 0; i < noteGroups.length; i++) {
					const group = await groups.findOne({ _id: noteGroups[i] });
					if (!group) {
						continue;
					}
					// console.log("group for note group ", JSON.stringify(noteGroups[i]), JSON.stringify(group));
					const groupUsers = group.peoples;
					for (var j = 0; j < groupUsers.length; j++) {
						if (!usersContains(groupUsers[j])) {
							users.push(groupUsers[j]);
						}
					}
				}
			}
		}
		console.log("note users", JSON.stringify(users));
		return users;
	}

	return [];
};
