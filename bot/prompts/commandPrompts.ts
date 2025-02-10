export const sellerCommands = {
  VIEW_PROFILE: {
    condition: 'Choose this command if user wants to view his profile',
  },
  ADD_PACKAGE: {
    condition:
      'Choose this command if the creator has sent a message in which he asks to save/create/add a package',
    commandPrompt: 'The user is a creator and wants to add a package.',
    data: {
      name: {
        details: 'Name of the package, empty string if missing',
        required: true,
      },
      description: {
        details:
          'Description of the package, nicely formatted. Empty string if missing, empty string is missing',
        required: false,
      },
      price: {
        details:
          'Price of the package. It should be a float number. 0 if missing',
        required: true,
      },
      negotitationLimit: {
        details:
          'Negotiation limit. 0 if missing. negotitation Limit or max discount is also this same field. Some number with percentage can be a negotitation limit too. There can be typos too.',
        required: false,
      },
    },
  },
  UPDATE_PROFILE: {
    condition:
      'Choose if user want to update their profile or send any info about them in message. Also choose if user sends his bio or phone number',
  },
  VIEW_PACKAGES: {
    condition: 'Choose this command if you the user wants to view his packages',
  },
  OTHER: {
    condition:
      'Choose this command if you want to do something else or the user has asked a suggestion or a question. Also choose other if user is asking what data in their profile or packages is missing. Choose other if user is asking how can they improve their packages',
  },
};

export const buyerCommands = {
  FIND_CREATORS: {
    condition: 'Choose this command if you want to find creators',
  },
  UPDATE_PROFILE: {
    condition: 'Choose if user want to update their profile',
  },
  VIEW_PROFILE: {
    condition: 'Choose this command if user wants to view his profile',
  },
  OTHER: {
    condition:
      'Choose this command if you want to do something else or the user has asked a suggestion or a question. Also choose other if user is asking what data in their profile or search is missing.',
  },
};
