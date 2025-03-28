const promptDetails = {
  addPackage: `
    This prompt is called when someone is adding a package. It should return these fields: name, description, price, negotiationLimit"
    `,
  getBrandProfileData: `
    Should return brandName, brandIndustry, brandLocation.
  `,
  getCreatorProfileData: `
  The JSON fields extracted from the text are:

phone
name
bio
telegramId
twitterId
discordId
facebookId
youtubeId
evmWallet
solWallet
niche
schedule
location
contentStyle
  `,
  findCreators: `{creatorsList},{messageText}. The output should be an array of user ids like this [id1, id2, id3]`,
  getCommandAndData: `{commandText} {message}. The output should be object with command field`,
  sendPackage: `{message}: used to send package to user. **Might be replaced soon**`,
  updatePackage: `{currentPackage}, {responseFormat}, {messageText}.  It should return one or more of these fields: name, description, price, negotiationLimit`,
  group_userPrompt: `{creatorDetails}, {packagesDetails}. Used as user prompt when  a query is received from a brand in a group`,
  group_systemPrompt: `
    This is system prompt for group communication. 
  `,
};

export default promptDetails;
