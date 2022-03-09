exports = async function (path) {
	var notesColl = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");

	var note = await notesColl.findOne({ path });

	if (note === null) {
		return null;
	}

	return context.functions.execute("getNote", note._id.toString());
};
