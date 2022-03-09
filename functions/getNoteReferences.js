exports = async function(){
  var references = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("references");
  const userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");

  let userReferences = await references.aggregate([{ $match: {}}]);
  
  
  userReferences = await userReferences.toArray();

  console.log("all user references", JSON.stringify(userReferences));
  
  return userReferences.map(ref => {
    return `__sekund__/${ref.noteUser.toString()}/${ref.notePath}`
  })
  
};