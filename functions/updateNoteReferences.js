exports = async function(toAdd, toDelete, vaultHash){
  var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
  var references = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("references");
  const userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");

  async function updateRefCount(noteId) {
    const count = await references.count({noteId: noteId});
    await notes.updateOne({_id: noteId},[{ $set: {refCount: count}}]);
    return await notes.findOne({_id: noteId});
  }

  for (const path of toAdd) {
    const parts = path.split('/');
    const noteUser = BSON.ObjectId(parts[1]);
    const notePath = path.substring(parts[0].length + parts[1].length + 2);
    const note = await notes.findOne({userId: noteUser, path: notePath})
    if (note) {
      await references.insertOne({userId: BSON.ObjectId(userId), noteUser, notePath, noteId: note._id})
      const updtNote = await updateRefCount(note._id);
      context.functions.execute("notifyNoteUsers", updtNote, "note.metadataUpdate", Date.now())
    }
  }
  
  for (const path of toDelete) {
    const parts = path.split('/');
    const noteUser = BSON.ObjectId(parts[1]);
    const notePath = path.substring(parts[0].length + parts[1].length + 2);
    const note = await notes.findOne({userId: noteUser, path: notePath})
    if (note) {
      await references.deleteOne({userId: BSON.ObjectId(userId), noteUser, notePath, noteId: note._id})
      const updtNote = await updateRefCount(note._id);
      context.functions.execute("notifyNoteUsers", updtNote, "note.metadataUpdate", Date.now())
    }
  }
  

};