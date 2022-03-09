exports = function(fileName) {
  // Instantiate an S3 service client
  const s3Service = context.services.get('S3').s3('eu-west-1');
  // Get the object from S3
  return s3Service.DeleteObject({
    'Bucket': `zewfedznuz-${context.environment.values.appName}`,
    'Key': fileName,
  })
  .then(deleteObjectOutput => {
    console.log(JSON.stringify(deleteObjectOutput));
  })
  .catch(console.error);
};