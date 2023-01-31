/* eslint-disable no-useless-escape */
const MobileRegexPattern = /^[6-9][0-9]{9}$/;
const MobileRegexNewPattern = /(?:(?:\+|0{0,2})91(\s*[\ -]\s*)?|[0]?)?[6789]\d{9}|(\d[ -]?){10}\d/;
const EmailRegexPattern = /^[-a-zA-Z0-9~!$%^&*_=+}{\'?]+(\.[-a-zA-Z0-9~!$%^&*_=+}{\'?]+)*@([a-zA-Z0-9][-a-zA-Z0-9]*(\.[-a-zA-Z0-9]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|in|global|fit|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?/;
const TitlePattern = /^[A-Za-z ]+$/;
// const CompanyPattern = /^[a-zA-Z]*([0-9]{0,6}[a-zA-Z]*)$/;
const CompanyPattern = /^(?![0-9 ]*$)[a-zA-Z ]*([0-9][a-zA-Z ]*){0,6}$/;
const JobTitlePattern = /^[ A-Za-z0-9_@.^*#&+-{)($!<>/|]*$/;
const GSTNumberRegexPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const OTPRegexPattern = /^\d{5}$/;
const WebsiteRegexPattern = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
const imagePattern = /\.(jpe?g|png|gif|bmp|svg)+/i;
const skypeIDPattern = /^[a-zA-Z][a-zA-Z0-9\.,\-_]{5,31}$/;
const facebookPattern = /(http(s)?:\/\/)(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(.+)/;
const linkedinPattern = /^(http(s)?:\/\/)([\w]+\.)?linkedin\.com\/(.+)\/(.+)$/;
const glassdoorPattern = /(http(s)?:\/\/)(?:www\.)?glassdoor(\.com|\.co\.in)\/(.+)/;
const twitterPattern = /(http(s)?:\/\/)(?:www\.)?twitter\.com\/(.+)/;

const isMobile = (text: string):boolean => MobileRegexNewPattern.test(text);
const isEmail = (text: string):boolean => EmailRegexPattern.test(text);
const GenericEmails = ['aol.com', 'comcast.net', 'facebook.com', 'gmail.com',
  'googlemail.com', 'google.com', 'hotmail.com', 'mac.com', 'me.com', 'mail.com',
  'msn.com', 'live.com', 'yahoo.com', 'hushmail.com', 'icloud.com', 'inbox.com',
  'lavabit.com', 'outlook.com', 'pobox.com', 'rocketmail.com', 'safe-mail.net',
  'wow.com', 'ygm.com', 'ymail.com', 'fastmail.fm', 'yandex.com', 'naver.com',
  'daum.net', 'nate.com', 'yahoo.co.in'];

export {
  MobileRegexPattern,
  EmailRegexPattern,
  TitlePattern,
  GSTNumberRegexPattern,
  JobTitlePattern,
  OTPRegexPattern,
  MobileRegexNewPattern,
  WebsiteRegexPattern,
  isMobile,
  isEmail,
  imagePattern,
  skypeIDPattern,
  facebookPattern,
  linkedinPattern,
  glassdoorPattern,
  twitterPattern,
  GenericEmails,
  CompanyPattern,
};
