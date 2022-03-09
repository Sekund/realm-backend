exports = async function(oldest, limit){
  var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
  const userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");

  let userNotes = await notes.aggregate([{ $match: { created: { $lt: oldest }, userId: BSON.ObjectId(userId) } },
  { $sort: { created: -1 } }, { $limit: limit },
  { $lookup: { from: "users", localField: "sharing.peoples", foreignField: "_id", as: "sharing.peoples" } },
  { $lookup: { from: "groups", localField: "sharing.groups", foreignField: "_id", as: "sharing.groups" } }]);
  
  userNotes = await userNotes.toArray();
  
  userNotes = userNotes.map(note => {
    if (note.stats && note.stats.read) {
      if (note.stats.read[userId]) {
        note.isRead = note.stats.read[userId];
      }
    }
    return note;
  })

  return userNotes;
};