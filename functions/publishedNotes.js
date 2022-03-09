exports = async function(path){
  var notes = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("notes");
  const userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");
  
  const notesDir = await notes.find({published: true})
  
  return notesDir;
};