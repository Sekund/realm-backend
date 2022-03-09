exports = async function(peopleId){
  var appName = context.values.get("appName");
  var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
  var users = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("users");
  var userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");

  var user = await users.findOne({_id: BSON.ObjectId(peopleId)}) 
  // notes that this user is sharing with that person
  var sharingNotes = await notes.aggregate([{ $match: { userId: BSON.ObjectId(userId), "sharing.peoples": BSON.ObjectId(peopleId) }}]).toArray();
  // notes that other users are sharing with this user
  var sharedNotes = await notes.aggregate([{ $match: { userId: BSON.ObjectId(peopleId), "sharing.peoples": BSON.ObjectId(userId) } }]);
  return {user, sharingNotes, sharedNotes}
};