/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
import { types, Instance, applySnapshot } from 'mobx-state-tree';
import { nFormatter } from 'service/login-service';
// import { v4 as uuidv4 } from 'uuid';
import { JobTitlePattern } from 'utils/constants';

const LocationModel = types.model('LocationModel', {
  place_id: types.maybe(types.string),
  description: types.maybe(types.string),
  vacancies: types.number,
});

const BasicInfoModel = types
  .model('BasicInfoModel', {
    // id: types.optional(types.identifier, uuidv4()),
    title: types.maybe(types.string),
    jobCategory: types.maybe(types.number),
    logo: types.optional(types.string, ''),
    isJobPostForCompany: types.optional(types.boolean, true),
    hiringOrgName: types.optional(types.string, ''),
    cityName: types.maybe(types.string),
    locations: types.array(LocationModel),
    vacancies: types.maybe(types.optional(types.number, 0)),
    salaryFormat: types.number,
    actualSalaryFormat: types.number,
    employmentType: types.string,
    minOfferedSalary: types.maybeNull(types.number),
    maxOfferedSalary: types.maybeNull(types.number),
    minSalary: types.string,
    maxSalary: types.string,
    softcheckObjTitlePattern: types.optional(types.boolean, false),
    softCheckObjCurrentAnnualMin: types.optional(types.boolean, false),
    softCheckObjCurrentAnnualMax: types.optional(types.boolean, false),
    softCheckObjCurrentMonthlyMin: types.optional(types.boolean, false),
    softCheckObjCurrentMonthlyMax: types.optional(types.boolean, false),
    softCheckObjCurrentAnnualHardMin: types.optional(types.boolean, false),
    softCheckObjCurrentAnnualHardMax: types.optional(types.boolean, false),
    softCheckObjCurrentMonthlyHardMin: types.optional(types.boolean, false),
    softCheckObjCurrentMonthlyHardMax: types.optional(types.boolean, false),
    softCheckObjCurrentMonthlyHardSal: types.optional(types.number, 0),
    softCheckObjCurrentAnnualHardSal: types.optional(types.number, 0),

    softCheckObjExpectedAnnualMin: types.optional(types.boolean, false),
    softCheckObjExpectedAnnualMax: types.optional(types.boolean, false),
    softCheckObjExpectedMonthlyMin: types.optional(types.boolean, false),
    softCheckObjExpectedMonthlyMax: types.optional(types.boolean, false),
    softCheckObjExpectedAnnualHardMin: types.optional(types.boolean, false),
    softCheckObjExpectedAnnualHardMax: types.optional(types.boolean, false),
    softCheckObjExpectedMonthlyHardMin: types.optional(types.boolean, false),
    softCheckObjExpectedMonthlyHardMax: types.optional(types.boolean, false),
    softCheckObjExpectedMonthlyHardSal: types.optional(types.number, 0),
    softCheckObjExpectedAnnualHardSal: types.optional(types.number, 0),

  })
  .actions((self) => ({
    updateTitle(title): void {
      self.title = title;
    },
    updateCategory(value): void {
      self.jobCategory = value;
    },
    updateJobForCompany(val: boolean): void {
      self.isJobPostForCompany = val;
    },
    updateCity(city): void {
      self.cityName = city;
    },
    addLocation(): void {
      applySnapshot(self,
        {
          ...self,
          locations: [...self.locations,
            { place_id: undefined, description: undefined, vacancies: 1 }],
        });
    },

    removelocality(): void {
      const data = [{ place_id: undefined, description: undefined, vacancies: 1 }];
      self.locations.replace(data);
    },
    removeLocation(index): void {
      const locations = [...self.locations];
      if (locations.length > index) { locations.splice(index, 1); }
      applySnapshot(self, { ...self, locations: [...locations] });

      const vacancies = locations.reduce((prev, curr) => {
        const openings = curr.vacancies ? curr.vacancies : 0;
        return prev + openings;
      }, 0);

      applySnapshot(self, { ...self, vacancies });
    },

    updateLocality(index, locality): void {
      const { place_id, description, vacancies = 1 } = locality;
      const locations = [...self.locations];

      locations[index] = locations[index]
        ? { ...locations[index], place_id, description }
        : { place_id, description, vacancies };

      applySnapshot(self, { ...self, locations: [...locations] });
    },

    updateCount(index, val): void {
      const locations = [...self.locations];

      if (locations[index]) {
        locations[index].vacancies = Number.isInteger(val) ? val : 0;
        applySnapshot(self, { ...self, locations: [...locations] });
      }

      const vacancies = locations.reduce((prev, curr) => {
        const openings = curr.vacancies ? curr.vacancies : 0;
        return prev + openings;
      }, 0);

      applySnapshot(self, { ...self, vacancies });
    },
    updateLogo(logo: string): void {
      self.logo = logo;
    },
    updateHiringOrgName(name: string): void {
      self.hiringOrgName = name;
    },
    updateSalaryPeriod(type): void {
      self.salaryFormat = type;
    },
    updateEmploymentType(empType: string): void {
      self.employmentType = empType;
    },
    updateMinSalary(value): void {
      self.minOfferedSalary = !Number.isNaN(parseInt(value, 10)) ? parseInt(value, 10) : null;
      self.minSalary = self.minOfferedSalary ? nFormatter(self.minOfferedSalary, 1) : '';
    },
    updateMaxSalary(value): void {
      self.maxOfferedSalary = !Number.isNaN(parseInt(value, 10)) ? parseInt(value, 10) : null;
      self.maxSalary = self.maxOfferedSalary ? nFormatter(self.maxOfferedSalary, 1) : '';
    },
    updatetitlecheck(value): void {
      if (value) {
        self.softcheckObjTitlePattern = !JobTitlePattern.test(value);
      } else { self.softcheckObjTitlePattern = false; }
    },
    updatesoftobj(valuemin): void {
      const value = !Number.isNaN(parseInt(valuemin, 10)) ? parseInt(valuemin, 10) : null;
      if (value != null) {
        if (self.salaryFormat === 0) {
          self.softCheckObjCurrentMonthlyMax = false;
          self.softCheckObjCurrentMonthlyMin = false;
          self.softCheckObjCurrentMonthlyHardMin = false;
          self.softCheckObjCurrentMonthlyHardMax = false;
          // self.min_offered_salary = isNumber(value) ? value : 0;
          if (value > 120000000) {
            self.softCheckObjCurrentAnnualHardMax = true;
            self.softCheckObjCurrentAnnualHardMin = false;
            self.softCheckObjCurrentAnnualMax = false;
          } else if (value >= 2000001 && value <= 120000000) {
            self.softCheckObjCurrentAnnualMax = true;
            self.softCheckObjCurrentAnnualMin = false;
            self.softCheckObjCurrentAnnualHardMax = false;
          } else if (value < 12000 && self.employmentType === 'FT') {
            self.softCheckObjCurrentAnnualHardMin = true;
            self.softCheckObjCurrentAnnualHardMax = false;
            self.softCheckObjCurrentAnnualMin = false;
            self.softCheckObjCurrentAnnualHardSal = 12000;
          } else if (value < 6000 && self.employmentType !== 'FT') {
            self.softCheckObjCurrentAnnualHardMin = true;
            self.softCheckObjCurrentAnnualHardMax = false;
            self.softCheckObjCurrentAnnualMin = false;
            self.softCheckObjCurrentAnnualHardSal = 6000;
          } else if (value < 60000) {
            self.softCheckObjCurrentAnnualMin = true;
            self.softCheckObjCurrentAnnualMax = false;
            self.softCheckObjCurrentAnnualHardMin = false;
          } else {
            self.softCheckObjCurrentAnnualMax = false;
            self.softCheckObjCurrentAnnualMin = false;
            self.softCheckObjCurrentAnnualHardMin = false;
            self.softCheckObjCurrentAnnualHardMax = false;
          }
        } else if (self.salaryFormat === 1) {
          self.softCheckObjCurrentAnnualMax = false;
          self.softCheckObjCurrentAnnualMin = false;
          self.softCheckObjCurrentAnnualHardMin = false;
          self.softCheckObjCurrentAnnualHardMax = false;

          if (value > 10000000) {
            self.softCheckObjCurrentMonthlyHardMax = true;
            self.softCheckObjCurrentMonthlyHardMin = false;
          } else if (value > 100000 && value <= 10000000) {
            self.softCheckObjCurrentMonthlyMax = true;
            self.softCheckObjCurrentMonthlyMin = false;
            self.softCheckObjCurrentMonthlyHardMax = false;
          } else if (value < 1000 && self.employmentType === 'FT') {
            self.softCheckObjCurrentMonthlyHardMin = true;
            self.softCheckObjCurrentMonthlyHardMax = false;
            self.softCheckObjCurrentMonthlyMin = false;
            self.softCheckObjCurrentMonthlyHardSal = 1000;
          } else if (value < 500 && self.employmentType !== 'FT') {
            self.softCheckObjCurrentMonthlyHardMin = true;
            self.softCheckObjCurrentMonthlyHardMax = false;
            self.softCheckObjCurrentMonthlyMin = false;
            self.softCheckObjCurrentMonthlyHardSal = 500;
          } else if (value < 5000) {
            self.softCheckObjCurrentMonthlyMin = true;
            self.softCheckObjCurrentMonthlyMax = false;
            self.softCheckObjCurrentMonthlyHardMin = false;
          } else {
            self.softCheckObjCurrentMonthlyMax = false;
            self.softCheckObjCurrentMonthlyMin = false;
            self.softCheckObjCurrentMonthlyHardMin = false;
            self.softCheckObjCurrentMonthlyHardMax = false;
          }
        }
      }
    },
    updatesoftexpectobj(valuemax): void {
      const value = !Number.isNaN(parseInt(valuemax, 10)) ? parseInt(valuemax, 10) : null;
      if (value != null) {
        if (self.salaryFormat === 0) {
          self.softCheckObjExpectedMonthlyMax = false;
          self.softCheckObjExpectedMonthlyMin = false;
          self.softCheckObjExpectedMonthlyHardMin = false;
          self.softCheckObjExpectedMonthlyHardMax = false;
          // self.min_offered_salary = isNumber(value) ? value : 0;
          if (value > 120000000) {
            self.softCheckObjExpectedAnnualHardMax = true;
            self.softCheckObjExpectedAnnualHardMin = false;
            self.softCheckObjExpectedAnnualMax = false;
          } else if (value >= 2000001 && value <= 120000000) {
            self.softCheckObjExpectedAnnualMax = true;
            self.softCheckObjExpectedAnnualMin = false;
            self.softCheckObjExpectedAnnualHardMax = false;
          } else if (value < 12000 && self.employmentType === 'FT') {
            self.softCheckObjExpectedAnnualHardMin = true;
            self.softCheckObjExpectedAnnualHardMax = false;
            self.softCheckObjExpectedAnnualMin = false;
            self.softCheckObjExpectedAnnualHardSal = 12000;
          } else if (value < 6000 && self.employmentType !== 'FT') {
            self.softCheckObjExpectedAnnualHardMin = true;
            self.softCheckObjExpectedAnnualHardMax = false;
            self.softCheckObjExpectedAnnualMin = false;
            self.softCheckObjExpectedAnnualHardSal = 6000;
          } else if (value < 60000) {
            self.softCheckObjExpectedAnnualMin = true;
            self.softCheckObjExpectedAnnualMax = false;
            self.softCheckObjExpectedAnnualHardMin = false;
          } else {
            self.softCheckObjExpectedAnnualMax = false;
            self.softCheckObjExpectedAnnualMin = false;
            self.softCheckObjExpectedAnnualHardMin = false;
            self.softCheckObjExpectedAnnualHardMax = false;
          }
        } else if (self.salaryFormat === 1) {
          self.softCheckObjExpectedAnnualMax = false;
          self.softCheckObjExpectedAnnualMin = false;
          self.softCheckObjExpectedAnnualHardMin = false;
          self.softCheckObjExpectedAnnualHardMax = false;

          if (value > 10000000) {
            self.softCheckObjExpectedMonthlyHardMax = true;
            self.softCheckObjExpectedMonthlyHardMin = false;
          } else if (value > 100000 && value <= 10000000) {
            self.softCheckObjExpectedMonthlyMax = true;
            self.softCheckObjExpectedMonthlyMin = false;
            self.softCheckObjExpectedMonthlyHardMax = false;
          } else if (value < 1000 && self.employmentType === 'FT') {
            self.softCheckObjExpectedMonthlyHardMin = true;
            self.softCheckObjExpectedMonthlyHardMax = false;
            self.softCheckObjExpectedMonthlyMin = false;
            self.softCheckObjExpectedMonthlyHardSal = 1000;
          } else if (value < 500 && self.employmentType !== 'FT') {
            self.softCheckObjExpectedMonthlyHardMin = true;
            self.softCheckObjExpectedMonthlyHardMax = false;
            self.softCheckObjExpectedMonthlyMin = false;
            self.softCheckObjExpectedMonthlyHardSal = 500;
          } else if (value < 5000) {
            self.softCheckObjExpectedMonthlyMin = true;
            self.softCheckObjExpectedMonthlyMax = false;
            self.softCheckObjExpectedMonthlyHardMin = false;
          } else {
            self.softCheckObjExpectedMonthlyMax = false;
            self.softCheckObjExpectedMonthlyMin = false;
            self.softCheckObjExpectedMonthlyHardMin = false;
            self.softCheckObjExpectedMonthlyHardMax = false;
          }
        }
      }
    },
  }

  )).views((self) => ({
    get gettotalCount(): number {
      return self.locations.reduce((prev, curr) => {
        const openings = curr.vacancies ? curr.vacancies : 0;
        return prev + openings;
      }, 0);
    },
    viewminSalary(): string {
      return self.minSalary;
    },
    viewmaxSalary(): string {
      return self.maxSalary;
    },
    checktitle(): string {
      return self.softcheckObjTitlePattern ? 'Only alphabets and  / - ( ) allowed.Numbers not allowed. Special characters not allowed twice.' : '';
    },

    softobj(): string {
      return self.salaryFormat === 0 && self.softCheckObjCurrentAnnualMin
        ? 'Min Annual salary seems too low'

        : self.salaryFormat === 0 && self.softCheckObjCurrentAnnualMax ? ' Min Annual salary seems too High'

          : self.salaryFormat === 1 && self.softCheckObjCurrentMonthlyMin

            ? 'Min Monthly salary seems too low.'

            : self.salaryFormat === 1 && self.softCheckObjCurrentMonthlyMax

              ? 'Min Monthly salary seems too High'
              : '';
    },
    hardcheckonmin(): string {
      return self.salaryFormat === 0 && self.softCheckObjCurrentAnnualHardMin ? ` Min Salary can't be less than ${self.softCheckObjCurrentAnnualHardSal}`
        : self.salaryFormat === 0 && self.softCheckObjCurrentAnnualHardMax

          ? " Min Salary can't be more than 12Cr "
          : self.salaryFormat === 1 && self.softCheckObjCurrentMonthlyHardMin

            ? ` Min Salary can't be less than ${self.softCheckObjCurrentMonthlyHardSal}`
            : self.salaryFormat === 1 && self.softCheckObjCurrentMonthlyHardMax

              ? " Min Salary can't be more than 1Cr PM" : '';
    },
    softexpectedobj(): string {
      return self.salaryFormat === 0 && self.softCheckObjExpectedAnnualMin

        ? 'Max Annual salary seems too low.'

        : self.salaryFormat === 0 && self.softCheckObjExpectedAnnualMax ? ' Max Annual salary seems too High'

          : self.salaryFormat === 1 && self.softCheckObjExpectedMonthlyMin

            ? 'Max Monthly salary seems too low.'

            : self.salaryFormat === 1 && self.softCheckObjExpectedMonthlyMax

              ? 'Max Monthly salary seems too High'
              : '';
    },
    hardcheckonmax(): string {
      return self.salaryFormat === 0 && self.softCheckObjExpectedAnnualHardMin ? ` Max Salary can't be less than ${self.softCheckObjExpectedAnnualHardSal}`
        : self.salaryFormat === 0 && self.softCheckObjExpectedAnnualHardMax

          ? " Max Salary can't be more than 12Cr "
          : self.salaryFormat === 1 && self.softCheckObjExpectedMonthlyHardMin

            ? ` Max Salary can't be less than ${self.softCheckObjExpectedMonthlyHardSal}`
            : self.salaryFormat === 1 && self.softCheckObjExpectedMonthlyHardMax

              ? " Max Salary can't be more than 1Cr PM" : '';
    },

  }));

const ShiftModel = types.model('ShiftModel', {
  maleOnly: false,
  // id: types.number,
  workStartTime: types.maybeNull(types.string),
  workEndTime: types.maybeNull(types.string),
  type: types.maybeNull(types.string),
});

const SalaryAndWorkTimingModel = types
  .model('SalaryAndWorkTimingModel', {

    count: types.maybe(types.number),
    comments: types.string,
    shifts: types.array(ShiftModel),
    jobDescription: types.string,
  })
  .actions((self) => ({

    updateWeeklyWorkingDays(count): void {
      self.count = Number.isInteger(count) ? count : 0;
    },
    updateCommentsOnOffDays(comments): void {
      self.comments = comments;
    },

    addShiftTiming(): void {
      applySnapshot(self, {
        ...self,
        shifts: [...self.shifts, {
          workStartTime: '09:00:00', workEndTime: '18:00:00', maleOnly: false, type: 'DAY',
        }],
      });
    },

    removeShiftTiming(index): void {
      const shifts = [...self.shifts];
      if (shifts.length > index) { shifts.splice(index, 1); }
      applySnapshot(self, { ...self, shifts: [...shifts] });
      // applySnapshot(self, { ...self, vacancies });
    },

    updateShiftTimings(id, timings): void {
      if (timings !== null) {
        const workStartTime = timings ? timings[0].format('HH:mm:ss') : '';
        const workEndTime = timings ? timings[1].format('HH:mm:ss') : '';

        const shifts = [...self.shifts];

        shifts[id] = shifts[id] ? { ...shifts[id], workStartTime, workEndTime } : {
          workStartTime, workEndTime, type: '', maleOnly: false,
        };

        applySnapshot(self, { ...self, shifts: [...shifts] });
      } else {
        const shifts = [...self.shifts];
        if (shifts.length > id) { shifts.splice(id, 1); }
        applySnapshot(self, { ...self, shifts: [...shifts] });
      }
    },

    updateShiftType(index, val): void {
      const shifts = [...self.shifts];

      if (shifts[index]) {
        shifts[index].type = val;
        applySnapshot(self, { ...self, shifts: [...shifts] });
      }
    },
    updateMaleCheck(index, val): void {
      const shifts = [...self.shifts];

      if (shifts[index]) {
        shifts[index].maleOnly = val;
        applySnapshot(self, { ...self, shifts: [...shifts] });
      }
    },
    updateJobDescription(jobDescription): void {
      self.jobDescription = jobDescription;
    },

  })).views(() => ({

  }));

const AboutJob = types.model('AboutJob', {
  basicInfo: BasicInfoModel,
  salaryAndWorkTiming: SalaryAndWorkTimingModel,

});

const LanguageModel = types.model('LanguageModel', {
  // id: types.number,
  language: types.maybeNull(types.number),
  proficiency: types.maybeNull(types.number),
  mode: types.array(types.number),
});
export const AddReqModel = types.model('AddReqModel', {
  languages: types.array(LanguageModel),

  skills: types.optional(types.array(types.string), []),
  mandatorySkill: types.optional(types.array(types.string), []),
  phoneMandatory: types.boolean,

  vehicleMandatory: types.boolean,
  phone: types.string,
  phoneId: types.number,
  laptop: types.boolean,
  vehicle: types.optional(types.array(types.string), []),
  vehicleId: types.array(types.number),
  licid: types.array(types.number),
  govid: types.array(types.number),
  otherid: types.array(types.number),
  licdoc: types.optional(types.array(types.string), []),
  govdoc: types.optional(types.array(types.string), []),
  otherdoc: types.optional(types.array(types.string), []),
  otherreq: types.optional(types.array(types.string), []),
})
  .actions((self) => ({

    addLanguage(): void {
      applySnapshot(self, {

        ...self,
        languages: [...self.languages, {
          language: null, proficiency: 1, mode: [1],
        }],
      });
    },
    removeLanguage(index): void {
      const languages = [...self.languages];
      languages.splice(index, 1);
      applySnapshot(self, { ...self, languages: [...languages] });
      // applySnapshot(self, { ...self, vacancies });
    },
    removeLanguageAll(): void {
      const languages = [...self.languages];

      languages.splice(0, languages.length);

      self.languages = [] as any;

      // applySnapshot(self, { ...self, languages: [...languages] });
    },

    updateLanguage(id, val): void {
      const languages = [...self.languages];
      languages[id].language = val;

      applySnapshot(self, { ...self, languages: [...languages] });
    },

    updateProficiency(index, val): void {
      const languages = [...self.languages];
      if (languages[index]) {
        languages[index].proficiency = val;
        applySnapshot(self, { ...self, languages: [...languages] });
      }
    },
    updateModes(val, index): void {
      const languages = [...self.languages];
      if (languages[index]) {
        languages[index].mode = val;

        // degrees[index].enable = val.length > 0;

        applySnapshot(self, { ...self, languages: [...languages] });
      }
    },

    updateMandatorySkill(manadatoryskill): void {
      self.mandatorySkill = manadatoryskill;
    },
    updateSkill(skill): void {
      self.skills = skill;
    },
    updatePhoneMandatory(phoneMandatory): void {
      self.phoneMandatory = phoneMandatory;
    },

    updateVehicleMandatory(vehicleMandatory): void {
      self.vehicleMandatory = vehicleMandatory;
    },
    updatephone(phone): void {
      self.phone = phone;
    },
    updatephoneid(phone): void {
      self.phoneId = phone;
    },
    updatelaptop(laptop): void {
      self.laptop = laptop;
    },
    updatevehicle(vehicle): void {
      if (self.vehicle.includes(vehicle)) {
        self.vehicle.splice(self.vehicle.indexOf(vehicle), 1);
      } else {
        self.vehicle.push(vehicle);
      }
    },
    updatevehicleid(vehicle): void {
      if (self.vehicleId.includes(vehicle)) {
        self.vehicleId.splice(self.vehicleId.indexOf(vehicle), 1);
      } else {
        self.vehicleId.push(vehicle);
      }
    },
    updateLicDoc(lic): void {
      if (self.licdoc.includes(lic)) {
        self.licdoc.splice(self.licdoc.indexOf(lic), 1);
      } else {
        self.licdoc.push(lic);
      }
    },
    updateLicidDoc(lic): void {
      if (self.licid.includes(lic)) {
        self.licid.splice(self.licid.indexOf(lic), 1);
      } else {
        self.licid.push(lic);
      }
    },
    updateGovDoc(gov): void {
      if (self.govdoc.includes(gov)) {
        self.govdoc.splice(self.govdoc.indexOf(gov), 1);
      } else {
        self.govdoc.push(gov);
      }
    },
    updateGovidDoc(gov): void {
      if (self.govid.includes(gov)) {
        self.govid.splice(self.govid.indexOf(gov), 1);
      } else {
        self.govid.push(gov);
      }
    },
    updateOtherDoc(other): void {
      if (self.otherdoc.includes(other)) {
        self.otherdoc.splice(self.otherdoc.indexOf(other), 1);
      } else {
        self.otherdoc.push(other);
      }
    },
    updateOtheridDoc(other): void {
      if (self.otherid.includes(other)) {
        self.otherid.splice(self.otherid.indexOf(other), 1);
      } else {
        self.otherid.push(other);
      }
    },
    updateOtherReq(field, req): void {
      self.otherreq[field] = req;
    },
    addOtherField(): void {
      self.otherreq.push('');
    },
    removeOtherField(field): void {
      const otherRequirements = [...self.otherreq];
      otherRequirements.splice(field, 1);
      applySnapshot(self, { ...self, otherreq: [...otherRequirements] });
    },
    removeAllSkills(): void {
      applySnapshot(self, { ...self, mandatorySkill: [], skills: [] });
    },
  }));

const DegreeModel = types.model('DegreeModel', {
  degree: types.maybe(types.string),
  degreeId: types.number,
  degreeMandatory: false,
  specialization: types.array(types.string),
  specializationId: types.array(types.number),
  specializationMandatory: false,
  enableDegree: types.optional(types.boolean, false),
  enableSpecialization: types.optional(types.boolean, false),
});

const CandidateInfo = types.model('CandidateInfo', {
  education: types.string,
  educationId: types.number,
  proficiencyMandatory: types.boolean,
  degrees: types.array(DegreeModel),
  minExperience: types.number,
  maxExperience: types.number,
  minExpyears: types.optional(types.maybeNull(types.string), 'any'),
  maxExpyears: types.optional(types.maybeNull(types.string), 'any'),
  experienceMandatory: types.boolean,
  minAge: types.maybeNull(types.number),
  maxAge: types.maybeNull(types.number),
  ageMandatory: types.boolean,
  genderMandatory: types.boolean,
  industryMandatory: types.boolean,
  industrytype: types.optional(types.array(types.string), []),
  industryId: types.array(types.number),
  candidateFunctionalarea: types.optional(types.array(types.string), []),
  candidateFunctionalareaid: types.array(types.number),
  gender: types.string,

}).actions((self) => ({

  updateeducation(education): void {
    self.education = education;
  },
  updateeducationid(education): void {
    self.educationId = education;
  },
  updateEducationMandatory(value): void {
    self.proficiencyMandatory = value;
  },
  addDegree(): void {
    applySnapshot(self, {
      ...self,
      degrees: [...self.degrees, {
        degree: undefined,
        degreeId: 0,
        specialization: [],
        specializationId: [] as Array<number>,
        degreeMandatory: false,
        specializationMandatory: false,

      }],
    });
  },
  updateDegree(val: string, index: number): void {
    const degrees = [...self.degrees];
    if (degrees[index]) {
      degrees[index].degree = val;
      degrees[index].enableDegree = val.length > 0;

      applySnapshot(self, { ...self, degrees: [...degrees] });
    }
  },
  removeDegree(index): void {
    const degrees = [...self.degrees];
    if (degrees.length > index) { degrees.splice(index, 1); }
    applySnapshot(self, { ...self, degrees: [...degrees] });
  },
  updateSpecialization(val, index): void {
    const degrees = [...self.degrees];
    if (degrees[index]) {
      degrees[index].specialization = val;
      degrees[index].enableSpecialization = val.length > 0;

      applySnapshot(self, { ...self, degrees: [...degrees] });
    }
  },
  updateSpecializationId(val, index): void {
    const degrees = [...self.degrees];
    if (degrees[index]) {
      degrees[index].specializationId = val;

      applySnapshot(self, { ...self, degrees: [...degrees] });
    }
  },
  updateDegreeid(val, index): void {
    const degrees = [...self.degrees];
    if (degrees[index]) {
      degrees[index].degreeId = val;
      applySnapshot(self, { ...self, degrees: [...degrees] });
    }
  },
  updateSpecializationmandatory(index, val): void {
    const degrees = [...self.degrees];
    if (degrees[index]) {
      degrees[index].specializationMandatory = val;
      applySnapshot(self, { ...self, degrees: [...degrees] });
    }
  },
  updateDegreeMandatory(index, val): void {
    const degrees = [...self.degrees];
    if (degrees[index]) {
      degrees[index].degreeMandatory = val;
      applySnapshot(self, { ...self, degrees: [...degrees] });
    }
  },
  clearDegrees(): void {
    applySnapshot(self, { ...self, degrees: [] });
  },
  updategender(gender): void {
    self.gender = gender;
  },
  updateMinExperience(minExperience): void {
    self.minExperience = minExperience;
  },
  updateMaxExperience(maxExperience): void {
    self.maxExperience = maxExperience;
  },
  updateMaxExpYears(maxExp): void {
    self.maxExpyears = maxExp;
  },
  updateMinExpYears(minExp): void {
    self.minExpyears = minExp;
  },
  updateMinAge(minAge): void {
    self.minAge = minAge;
  },
  updateMaxAge(maxAge): void {
    self.maxAge = maxAge;
  },
  updateExperienceMandatory(experienceMandatory): void {
    self.experienceMandatory = experienceMandatory;
  },
  updateAgeMandatory(ageMandatory): void {
    self.ageMandatory = ageMandatory;
  },
  updateGenderMandatory(genderMandatory): void {
    self.genderMandatory = genderMandatory;
  },
  updateIndustryMandatory(industryMandatory): void {
    self.industryMandatory = industryMandatory;
  },
  updateindustrytype(industrytype): void {
    self.industrytype = industrytype;
  },
  updateindustryid(industryid): void {
    self.industryId = industryid;
  },
  updateCandidateFunctionalarea(candidateFunctionalarea): void {
    self.candidateFunctionalarea = candidateFunctionalarea;
  },

  updateCandidateFunctionalareaid(candidateFunctionalareaid): void {
    self.candidateFunctionalareaid = candidateFunctionalareaid;
  },

}));

const CandidateRequirement = types.model('CandidateRequirement', {
  candidateInfo: CandidateInfo,
  addReqInfo: AddReqModel,
});

const CallPocModel = types.model('CallPocModel', {
  name: types.optional(types.string, ''),
  contact: types.optional(types.string, ''),
}).actions((self) => ({
  updateCallPocName(value): void {
    self.name = value;
  },
  updateCallPocContact(value): void {
    self.contact = value;
  },
}));

const ApplicationProcess = types.model('ApplicationProcess', {
  shareContactToPublic: types.boolean,
  clientApprovalRequired: types.boolean,
  callPoc: CallPocModel,
  isCallPocNull: types.boolean,
  isResumeSubscribed: types.boolean,
  callHrEnabled: types.boolean,
  callHrOpted: types.boolean,
  interviewType: types.string,
  formSubmitted: false,
}).actions((self) => ({
  updateShareContactToPublic(value): void {
    self.shareContactToPublic = value;
  },
  updateClientApprovalRequired(value): void {
    self.clientApprovalRequired = value;
  },
  updateIsResumeSubscribed(value): void {
    self.isResumeSubscribed = value;
  },
  updateIsCallPocNull(value): void {
    self.isCallPocNull = value;
  },
  updateCallHrEnabled(value): void {
    self.callHrEnabled = value;
  },
  updateCallHrOpted(value): void {
    self.callHrOpted = value;
  },
  updateInterviewType(value): void {
    self.interviewType = value;
  },
  updateFormSubmitted(value): void {
    self.formSubmitted = value;
  },
}));

// const PricingPlan = types.model('PricingPlan', {});

const ManagersModel = types.model('ManagersModel', {
  type: types.string,
  firstName: types.string,
  lastName: types.string,
  email: types.string,
  mobile: types.string,
});

const OrganizationOfficesModel = types.model('OrganizationOfficesModel', {
  address: types.string,
  formattedAddress: types.string,
  id: types.number,
  location: types.string,
  placeId: types.string,
});

const OrganizationIndustryModel = types.model('OrganizationIndustryModel', {
  name: types.string,
  id: types.string,
});

const JobPostStore = types.model('JobPost', {
  aboutJob: AboutJob,
  candidateRequirement: CandidateRequirement,
  applicationProcess: ApplicationProcess,
  id: types.string,
  duplicateId: types.string,
  pricingPlanType: types.string,
  saveAsDraft: false,
  jobState: types.string,
  jobStage: types.string,
  redirectToPrevious: false,
  nextInProgress: false,
  skipInProgress: false,
  skipToLastInProgress: false,
  saveAndClose: false,
}).actions((self) => ({
  updateSaveAsDraft(value): void {
    self.saveAsDraft = value;
  },
  updateJobId(value): void {
    self.id = value;
  },
  updateDuplicateJobId(value): void {
    self.duplicateId = value;
  },
  updateJobState(value): void {
    self.jobState = value;
  },
  updatePricingPlanType(value): void {
    self.pricingPlanType = value;
  },
  updateRedirectToPrevious(value): void {
    self.redirectToPrevious = value;
  },
  updateNextInProgress(value): void {
    self.nextInProgress = value;
  },
  updateSkipInProgress(value): void {
    self.skipInProgress = value;
  },
  updateSkipToLastInProgress(value): void {
    self.skipToLastInProgress = value;
  },
  updateSaveAndClose(value) : void {
    self.saveAndClose = value;
  },
}));

const OrganizationStore = types.model('OrganizationStore', {
  id: types.string,
  managers: types.optional(types.array(ManagersModel), []),
  offices: types.optional(types.array(OrganizationOfficesModel), []),
  name: types.optional(types.string, ''),
  type: types.maybeNull(types.string),
  industry: types.maybeNull(OrganizationIndustryModel),
  logo: types.string,
});

const UserStore = types.model('UserStore', {
  id: types.string,
  firstName: types.string,
  lastName: types.string,
  mobile: types.string,
  email: types.string,
  mobileVerfied: types.boolean,
  whatsappSubscribed: types.boolean,
}).actions((self) => ({
  updateUserId(value): void {
    self.id = value;
  },
  updateUserFirstName(value): void {
    self.firstName = value;
  },
  updateUserLastName(value): void {
    self.lastName = value;
  },
  updateUserMobile(value): void {
    self.mobile = value;
  },
  updateUserEmail(value): void {
    self.email = value;
  },
  updateMobileVerfiedStatus(value:boolean): void {
    self.mobileVerfied = value;
  },
  updateWhatsappSubscriptionStatus(value:boolean): void {
    self.whatsappSubscribed = value;
  },
}));

export { JobPostStore, OrganizationStore, UserStore };

export type JobPost = Instance<typeof JobPostStore>;
export type AboutJob = Instance<typeof AboutJob>;
export type ApplicationProcess = Instance<typeof ApplicationProcess>;
export type LocationModel = Instance<typeof LocationModel>;
export type BasicInfoModel = Instance<typeof BasicInfoModel>;
export type OrganizationStoreModel= Instance<typeof OrganizationStore>;
export type UserDetailsStoreModel= Instance<typeof UserStore>;

export type CallPocModel = Instance<typeof CallPocModel>;
export type SalaryAndWorkTimingModel = Instance<typeof SalaryAndWorkTimingModel>;
