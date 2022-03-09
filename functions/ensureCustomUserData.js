exports = async function(authEvent) {

  const realmUser = authEvent.user;
  
  const {email, id} = authEvent.user.data;
  
  const users = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("users");
  const sekundUser = await users.findOne({email, userId: realmUser.id});
  
  console.log("sekundUser", JSON.stringify(sekundUser))
  
  if (!sekundUser) {
    
    await users.insertOne({email, image: '', name: '', userId: realmUser.id})
    
  }
  
  return "OK";
};