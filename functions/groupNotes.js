exports = async function(groupId){
  var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
  const userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");

  var groupNotes = await notes.aggregate([{ $match: {"sharing.groups": BSON.ObjectId(groupId) } },
  { $lookup: { from: "users", localField: "sharing.peoples", foreignField: "_id", as: "sharing.peoples" } },
  { $lookup: { from: "groups", localField: "sharing.groups", foreignField: "_id", as: "sharing.groups" } }]);

  groupNotes = await groupNotes.toArray();
  
  groupNotes = groupNotes.map(note => {
    if (note.stats && note.stats.read && note.stats.read[userId]) {
        note.isRead = note.stats.read[userId];
    }
    return note;
  })

  return groupNotes;
};