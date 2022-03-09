exports = async function (users, eventType, updateTime, data) {
	var events = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("events");

	for (var i = 0; i < users.length; i++) {
		const userId = users[i];
		events.insertOne({ type: eventType, updateTime, data, userId });
	}
};
