exports = async function(note, eventType, updateTime){
  
  let noteUsers = await context.functions.execute("getNoteUsers", note);

  console.log("about to notify noteUsers", JSON.stringify(noteUsers));

  await context.functions.execute("notifyUsers", noteUsers, eventType, updateTime, note);

};