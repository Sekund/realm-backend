exports = async function (letters, userIds) {
  var usersColl = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("users");
  var permissionsColl = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("permissions");
  const users = await usersColl.find({ $or: [{ name: { $regex: letters, $options: "i" } }, { email: { $regex: letters, $options: "i" } }], _id: { $nin: userIds } });
  const userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");

//  const users = await permissionsColl.find({user: {_id: userId}, _id: { $nin: userIds }})

  var groupsColl = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("groups");
  const query = { name: { $regex: letters, $options: "i" }, peoples: BSON.ObjectId(userId) };

  const groups = await groupsColl.find(query);
  
  return {users, groups};
};
