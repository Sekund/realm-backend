exports = async function(arg){
  var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
  var userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");

  // notes that this user is sharing with other users
  var sharingNotes = await notes.aggregate([
    { $match: { userId: BSON.ObjectId(userId), "sharing.peoples.0": { $exists: true } }},
    { $project: {_id: false, sharing: true, stats: true, updated: true}}
  ]);
  
  // notes that other users are sharing with this user
  var sharedNotes = await notes.aggregate([
    { $match: { "sharing.peoples": BSON.ObjectId(userId) } },
    { $project: {_id: false, userId: true, stats: true, updated: true}}
  ]);
  
  sharingNotes = await sharingNotes.toArray();
  sharedNotes = await sharedNotes.toArray();
  
  sharingNotes = sharingNotes.map(note => {
    if (note.stats && note.stats.read) {
      if (note.stats.read[userId]) {
        note.isRead = note.stats.read[userId];
      }
    }
    return note;
  })

  sharedNotes = sharedNotes.map(note => {
    if (note.stats && note.stats.read) {
      if (note.stats.read[userId]) {
        note.isRead = note.stats.read[userId];
      }
    }
    return note;
  })
  
  return {sharingNotes, sharedNotes}
};