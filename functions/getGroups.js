exports = async function(arg){
  var groups = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("groups");
  var userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");
  
  var userGroups = await groups.aggregate([{ $match: {peoples: BSON.ObjectId(userId)}},
  { $lookup: { from: "users", localField: "peoples", foreignField: "_id", as: "peoples" } }])
  return userGroups;
};