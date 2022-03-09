exports = async function(groupId){
  var groups = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("groups");
  var userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");

  const oldGroup = await groups.findOne({_id: groupId})
  await groups.updateOne( { _id: groupId }, { $pull: { peoples: BSON.ObjectId(userId) } });
  
  context.functions.execute("notifyUsers", oldGroup.peoples, "group.upsert", Date.now(), {groupId: groupId});

};

