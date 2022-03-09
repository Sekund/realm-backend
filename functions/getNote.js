function getUser(users, authorId) {
	for (var i = 0; i < users.length; i++) {
		if (users[i]._id.toString() === authorId) {
			return users[i];
		}
	}
	return null;
}

function isAllowedRead(note, userId) {
	if (note.userId.toString() === userId) {
		return true;
	}
	for (let i = 0; i < note.sharing.peoples.length; i++) {
		const p = note.sharing.peoples[i];
		if (p._id.toString() === userId) {
			return true;
		}
	}
	for (let i = 0; i < note.sharing.groups.length; i++) {
		const g = note.sharing.groups[i];
		for (let j = 0; j < g.peoples.length; j++) {
			const gp = g.peoples[j];
			if (gp.toString() === userId) {
				return true;
			}
		}
	}
	return false;
}

exports = async function (nId) {
	var notesColl = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
	var noteId = BSON.ObjectId(nId);
	var userId = context.user.custom_data._id || (await context.functions.execute("getCustomUserDataId"));

	// TODO: verify that the user has indeed access to this note
	var note = await notesColl.findOne({ _id: noteId });

	if (!note) {
		return null;
	}

	var comments = note.comments;
	var usersColl = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("users");

	if (comments && comments.length > 0) {
		// This call will mess up the data (e.g. the author will not be present, but other fields as well)
		// note.comments.sort((a, b) => (a.created > b.created) ? -1 : 1);
		note.comments.forEach(async (c) => {
			// todo refactor, or at least optimize this
			if (c.author && !c.author.text) {
				var commentAuthor = await usersColl.findOne({ _id: c.author });
				if (commentAuthor) {
					const { name, image, email, _id } = commentAuthor;
					c.author = { _id, name, image, email };
				}
			}
		});
	}
	if (note.sharing) {
		if (note.sharing.peoples && note.sharing.peoples.length > 0) {
			const populatedPeoples = [];
			for (const p of note.sharing.peoples) {
				if (p) {
					const person = await usersColl.findOne({ _id: p });
					if (person) {
						populatedPeoples.push(person);
					}
				}
			}
			note.sharing.peoples = populatedPeoples;
		}
		if (note.sharing.groups && note.sharing.groups.length > 0) {
			var groupsColl = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("groups");
			const populatedGroups = [];
			for (const g of note.sharing.groups) {
				if (g) {
					const group = await groupsColl.findOne({ _id: g });
					if (group) {
						populatedGroups.push(group);
					}
				}
			}
			note.sharing.groups = populatedGroups;
		}
	}

	if (!context.functions.execute("hasReadAccessToNote", note, userId)) {
		return null;
	}

	if (note.stats && note.stats.read && note.stats.read[userId.toString()]) {
		note.isRead = note.stats.read[userId.toString()];
	}

	/*  if (note.userId.toString() !== userId && note.readCount) {
    delete note.readCount;
  } */

	return note;
};
