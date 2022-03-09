exports = async function(userId, eventType, updateTime, data){
  var events = context.services.get("mongodb-atlas").db(context.environment.values.appName).collection("events");
  await events.insertOne({type: eventType, updateTime, data, userId})
  return "done"
};