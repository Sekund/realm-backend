exports = async function(gId){
  var groups = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("groups");
  var userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");

  var groupId = BSON.ObjectId(gId);

  var userGroups = await groups.aggregate([{ $match: {_id: groupId, peoples: BSON.ObjectId(userId)}},
  { $lookup: { from: "users", localField: "peoples", foreignField: "_id", as: "peoples" } }])
  return userGroups;
};