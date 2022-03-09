exports = async function(group){
  var groups = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("groups");
  var userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");

  const existing = await groups.findOne({name: group.name});
  
  // je n'y crois pas
  
  if ((existing && !group._id) || (existing && group._id && group._id.toString() !== existing._id.toString())) {
    console.log("A group by that name already exists");
    throw "A group by that name already exists";
  }

  let result;
  if (group._id) {
    result = await groups.updateOne({_id: group._id}, {...group, updated: Date.now()});
  } else {
    result = await groups.insertOne({...group, peoples: [...group.peoples, BSON.ObjectId(userId)], userId: BSON.ObjectId(userId), created: Date.now(), updated: Date.now()});
    group._id = result.insertedId
  }
  
  var userGroups = await groups.aggregate([{ $match: {_id: group._id}},
  { $lookup: { from: "users", localField: "peoples", foreignField: "_id", as: "peoples" } }])
  
  context.functions.execute("notifyUsers", group.peoples, "group.upsert", Date.now(), {groupId: group._id});

  return userGroups;
};