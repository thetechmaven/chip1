import { USER_TYPE_TUTOR } from '../contants';
import * as constants from '../contants';
import { jobCategories } from '../utils/res';

export const ADD_EDIT_PROFILE = [
  [
    { text: 'Group', callback_data: constants.PROFILE_GROUP },
    { text: 'Name', callback_data: constants.PROFILE_NAME },
  ],
  [
    { text: 'HP', callback_data: constants.PROFILE_HP },
    { text: 'Email', callback_data: constants.PROFILE_EMAIL },
  ],
  [
    { text: 'Age', callback_data: 'c' },
    { text: 'Years', callback_data: constants.PROFILE_EXPERIENCE },
  ],
  [
    { text: 'Gender', callback_data: constants.PROFILE_GENDER },
    { text: 'Race', callback_data: constants.PROFILE_RACE },
  ],
  [
    { text: 'Citizenship', callback_data: constants.PROFILE_CITIZENSHIP },
    { text: 'Qualification', callback_data: constants.PROFILE_QUALIFICATION },
  ],
  [
    { text: 'Experience', callback_data: constants.PROFILE_COVER },
    { text: 'Profile Picture', callback_data: constants.PROFILE_PICTURE },
  ],
  [
    { text: 'Job Category', callback_data: constants.PROFILE_JOB_CATEGORY },
    {
      text: 'Change Job Preference',
      callback_data: constants.PROFILE_JOB_PREFERENCE,
    },
  ],
  [
    {
      text: 'Change Location Preference',
      callback_data: constants.PROFILE_LOCATION_PREFERENCE,
    },
    { text: 'Delete Profile', callback_data: 'c' },
  ],
  [{ text: 'Back', callback_data: USER_TYPE_TUTOR }],
];

export const PROFILE_GROUP = [
  [{ text: 'NSF', callback_data: 'GROUP:NSF' }],
  [
    {
      text: 'Waiting for university',
      callback_data: 'GROUP:WAITING_FOR_UNIVERSITY',
    },
  ],
  [{ text: 'Studying in poly', callback_data: 'GROUP:STUDYING_IN_POLY' }],
  [{ text: 'Undergraduate', callback_data: 'GROUP:UNDERGRADUATE' }],
  [{ text: 'Graduate, Part-time tutor', callback_data: 'GROUP:GRADUATE' }],
  [{ text: 'Ex-MOE Teacher', callback_data: 'GROUP:EX_MOE' }],
  [{ text: 'Current MOE Teacher', callback_data: 'GROUP:CURRENT_MOE' }],
  [{ text: 'Back', callback_data: constants.VIEW_EDIT_PROFILE }],
  [],
];

export const PROFILE_GENDER = [
  [
    { text: 'Male', callback_data: constants.GENDER_MALE },
    { text: 'Female', callback_data: constants.GENDER_FEMALE },
  ],
  [{ text: 'BACK', callback_data: constants.VIEW_EDIT_PROFILE }],
];

export const PROFILE_RACE = [
  [{ text: 'Chinese', callback_data: 'RACE:CHINESE' }],
  [{ text: 'Malay', callback_data: 'RACE:MALAY' }],
  [{ text: 'Indian', callback_data: 'RACE:INDIAN' }],
  [{ text: 'Eurasion', callback_data: 'RACE:EURAION' }],
  [{ text: 'Back', callback_data: constants.VIEW_EDIT_PROFILE }],
];

export const PROFILE_CITIZENSHIP = [
  [{ text: 'Singapore Citizen', callback_data: 'CITIZENSHIP:SINGAPORE' }],
  [{ text: 'Permanent Resident (PR)', callback_data: 'CITIZENSHIP:PR' }],
  [{ text: 'Foriegner', callback_data: 'CITIZENSHIP:FORIEGNER' }],
  [{ text: 'Back', callback_data: constants.VIEW_EDIT_PROFILE }],
];

export const PROFILE_JOB_CATEGORY = (selected: string[]) => {
  const options = jobCategories.map((c) => ({
    text: `${selected.includes(c.id) ? '✅ ' : ''}` + c.type,
    callback_data: 'JOB_CATEGORY:' + c.id,
  }));
  const buttons: unknown[] = [];
  for (let i = 0; i < options.length; i += 2) {
    buttons.push([options[i], options[i + 1]]);
  }
  buttons.push([
    {
      text: 'Back',
      callback_data: constants.VIEW_EDIT_PROFILE,
    },
    {
      text: 'Done',
      callback_data: constants.PROFILE_DONE,
    },
  ]);
  return buttons;
};

export const PROFILE_JOB_PREFERENCE = (selected: string[]) => {
  const getMark = (id: string) => (selected.includes(id) ? '✅ ' : '');
  return [
    [
      {
        text: getMark('FULLTIME') + 'Full time',
        callback_data: 'JOB_PREFERENCE:FULLTIME',
      },
    ],
    [
      {
        text: getMark('PARTTIME') + 'Part time',
        callback_data: 'JOB_PREFERENCE:PARTTIME',
      },
    ],
    [
      {
        text: getMark('INTERNSHIP') + 'Internship',
        callback_data: 'JOB_PREFERENCE:INTERNSHIP',
      },
    ],
    [
      {
        text: getMark('CONTRACT') + 'Contract',
        callback_data: 'JOB_PREFERENCE:CONTRACT',
      },
    ],
    [
      { text: 'Back', callback_data: constants.VIEW_EDIT_PROFILE },
      { text: 'Done', callback_data: constants.PROFILE_DONE },
    ],
  ];
};

export const PROFILE_LOCATION_PREFERENCES = () => {
  return [
    [{ text: 'North', callback_data: 'LOCATION:NORTH' }],
    [{ text: 'East', callback_data: 'LOCATION:EAST' }],
    [{ text: 'West', callback_data: 'LOCATION:WEST' }],
    [{ text: 'Central', callback_data: 'LOCATION:CENTRAL' }],
    [{ text: 'Northeast', callback_data: 'LOCATION:NORTHEAST' }],
  ];
};
