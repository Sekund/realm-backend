exports = async function(arg){
  var realmUser = context.user;
  const mongodb = context.services.get("mongodb-atlas");
  const users = mongodb.db(context.environment.values.appName).collection("users");
  const sekundUser = await users.findOne({userId:realmUser.id});

  return sekundUser._id.toString();
};