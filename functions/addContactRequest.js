exports = async function(user){
  const userId = context.user.custom_data._id ||  await context.functions.execute("getCustomUserDataId");
  const permissions = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("permissions");

  const now = Date.now();
  
  const found = await permissions.findOne({$or: [{user: BSON.ObjectId(userId), userId: user._id}, {user: user._id, userId: BSON.ObjectId(userId)}]})
  
  if (!found) {
    await permissions.insertOne({
      status: "requested",
      user: BSON.ObjectId(userId),
      userId: user._id,
      created: now,
      updated: now,
    })
  }
  
  await context.functions.execute("notifyUsers", [user._id, BSON.ObjectId(userId)], "permissions.changed", Date.now(), {});

  
};