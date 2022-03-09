exports = async function(){
  var permissionsColl = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("permissions");
  const userId = context.user._id || await context.functions.execute("getCustomUserDataId");

  console.log("loading permissions", BSON.ObjectId(userId))

  const matchClause = { $or : [ {userId: BSON.ObjectId(userId)}, {user: BSON.ObjectId(userId)} ] };
  const userLookupClause = { from: "users", localField: "user", foreignField: "_id", as: "user" };
  const userIdLookupClause = { from: "users", localField: "userId", foreignField: "_id", as: "userInfo" };
  const groupLookupClause = { from: "groups", localField: "group", foreignField: "_id", as: "group" };
  const found = await permissionsColl.aggregate( [{$match: matchClause}, {$lookup: userLookupClause}, {$lookup: groupLookupClause}, {$lookup: userIdLookupClause}])
  
  return found;
};