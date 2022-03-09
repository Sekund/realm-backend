exports = async function(name){
  var users = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("users");
  
  const existing = await users.findOne({name})
  
  return existing ? true : false;
};