exports = async function(arg){
  var users = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("users");
  const found = await users.aggregate([{$match: {}}, {$project: {name: 1, image: 1, email: 1, _id: 1}}]);

  return found;  
  
};