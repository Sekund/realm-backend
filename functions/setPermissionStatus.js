exports = async function(sharingPermission, status){
  var permissions = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("permissions");
  const userId = context.user.custom_data._id || await context.functions.execute("getCustomUserDataId");

  const existingPermission = await permissions.findOne({_id: sharingPermission._id});

  if (sharingPermission._id) {
    const existingPermission = await permissions.findOne({_id: sharingPermission._id});
    await permissions.updateOne({_id: sharingPermission._id},{...existingPermission, status});
    
    switch(status) {
      
      case "accepted":
        if (existingPermission.group) {
          const group = {...existingPermission.group, peoples: [...existingPermission.group.peoples, userId]};
          context.functions.execute("upsertGroup", group);
        }
        break;
      case "rejected":
        const deleteResult = await permissions.deleteOne({_id: sharingPermission._id});
        break;
      case "blocked":
        break;
      
    }
    
  } else {
    await permissions.insertOne({...sharingPermission, status});
  }
  
  await context.functions.execute("notifyUsers", [sharingPermission.user._id, sharingPermission.userId], "permissions.changed", Date.now(), {});

  
};