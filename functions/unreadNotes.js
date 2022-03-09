exports = async function(arg){
  
  var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
  var groups = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("groups");
  const userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");

  //let unreadNotes = await notes.aggregate([{ $match: {$expr:{$gt:["updated", "note.stats.read['" + userId.toString()  + "']"]}} }]);
  
  const noteIds = new Set();
  const userNotes = [];
  
  function addUserNote(n) {
    if (!noteIds.has(n._id.toString())) {
      noteIds.add(n._id.toString());
      userNotes.push(n);
    }
  }
  
  const userGroups = await (await groups.aggregate([{$match: {peoples : BSON.ObjectId(userId)}}])).toArray();

  for (const group of userGroups) {
    const groupNotes = await (await notes.aggregate([{ $match: {"sharing.groups": group._id} }])).toArray()

    if (groupNotes.length) {
      for (const note of groupNotes) {
        addUserNote(note);
      }
    }
  }
  
  console.log("done adding groups")
  
  const sharedNotes = await (await notes.aggregate([{ $match: { "sharing.peoples": BSON.ObjectId(userId) } }])).toArray();
  
  console.log("sharedNotes: " + sharedNotes.length)
  
  if (sharedNotes.length) {
    for (const note of sharedNotes) {
      addUserNote(note);
    }
  }
  
  const sharingNotes = await (await notes.aggregate([{ $match: { userId: BSON.ObjectId(userId), "sharing.peoples.0": { $exists: true } }}])).toArray();

  console.log("sharingNotes: " + sharingNotes.length);

  if (sharingNotes.length) {
    for (const note of sharingNotes) {
      addUserNote(note);
    }
  }
  
  console.log("total number of user notes: " + userNotes.length);
  
  const unreadNotes = [];
  
  for (const note of userNotes) {
    if ((note.stats && note.stats.read && note.stats.read[userId] && note.stats.read[userId] < note.updated) || (note.stats && note.stats.read && !note.stats.read[userId])) {
      unreadNotes.push(note);
    } 
  }
  
  const result = {all: unreadNotes, home: [], peoples: [], groups: []}
  
  for (const unreadNote of unreadNotes) {
    unreadNote.isRead = unreadNote.stats.read[userId.toString()];
    delete unreadNote.stats;
    if (unreadNote.userId.toString() === userId) {
      result.home.push(unreadNote);
    }
    for (const people of unreadNote.sharing.peoples) {
      if (people.toString() === userId) {
        result.peoples.push(unreadNote);
      }
    }
    if (unreadNote.sharing.groups.length > 0) {
      result.groups.push(unreadNote);
    }
  }
  
  return result;
  
};