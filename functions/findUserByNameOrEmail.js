exports = async function(nameOrEmail){
  var usersColl = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("users");

  const userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");
  const matchClause = { $or: [{ name: { $eq: nameOrEmail } }, { email: { $eq: nameOrEmail } }] };
  
  const foundUsers = await (await usersColl.aggregate([{$match: matchClause}])).toArray();

  if (foundUsers.length === 1) {
    if (foundUsers[0]._id.toString() === userId) {
      return null;
    }
    return foundUsers[0];
  }
  
  return null;
};