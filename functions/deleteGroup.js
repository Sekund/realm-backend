exports = async function(groupId){
  
  var groups = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("groups");

  const oldGroup = await groups.findOne({_id: groupId})
  result = await groups.deleteOne({_id: groupId});

  context.functions.execute("notifyUsers", oldGroup.peoples, "group.delete", Date.now(), {groupId: groupId});

  return result;
};