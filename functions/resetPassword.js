  exports = ({ token, tokenId, username, password }, appId) => {
    const sgMail = require('@sendgrid/mail')
    const apiKey = context.values.get("sendgridApiKey");
    sgMail.setApiKey(apiKey);
  
    const msg = {
      to: username,
      from: 'no-reply@sekund.io',
      templateId: 'd-688cba1edfdf4187932451750eed09e8',
      dynamicTemplateData: {
        resetLink: `https://join.sekund.io/resetPassword?token=${token}&tokenId=${tokenId}&appId=${appId}`
      },
    };
  
    sgMail.send(msg);

    return { status: 'pending' };
    
  };
