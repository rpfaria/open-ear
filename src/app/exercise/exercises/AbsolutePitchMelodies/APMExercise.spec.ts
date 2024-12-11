import * as _ from 'lodash';
import { ExerciseTest } from '../../ExerciseTest';
import Exercise from '../../exercise-logic';
import { testExercise } from '../testing-utility/test-exercise.spec';
import {
  NoteName,
  noteDescriptorList,
  noteExercise,
} from './APMExercise';

describe(noteExercise.name, () => {
  const context = testExercise({
    getExercise: noteExercise,
    settingDescriptorList: [
      'Included Intervals',
      'Play Wrong Answer',
    ],
  });
  const allIntervals: NoteName[] = _.map(noteDescriptorList, 'name');

  describe('getAnswersList', () => {
    it('should include all intervals by default', () => {
      expect(context.exercise.getAnswerList()).toEqual(
        ExerciseTest.answerListContaining(allIntervals),
      );
    });

    it('should return only the intervals set by the settings', () => {
      const intervals: NoteName[] = ['Minor 2nd', 'Major 2nd'];
      expect(context.exercise.updateSettings).toBeTruthy();
      context.exercise.updateSettings?.({
        includedAnswers: ['Minor 2nd', 'Major 2nd'],
      });
      expect(Exercise.flatAnswerList(context.exercise.getAnswerList())).toEqual(
        jasmine.arrayWithExactContents(intervals),
      );
    });
  });

  describe('settings', () => {
    it('should have the "included answers" settings', () => {
      expect(context.exercise.getSettingsDescriptor?.()).toEqual(
        jasmine.arrayContaining([
          jasmine.objectContaining<Exercise.SettingsControlDescriptor>({
            key: 'includedAnswers',
            descriptor: jasmine.objectContaining({
              controlType: 'included-answers',
              answerList: ExerciseTest.answerListContaining(allIntervals),
            }),
          }),
        ]),
      );
    });
  });

  describe('getQuestion', () => {
    it('should return truthy value', () => {
      expect(context.exercise.getQuestion()).toBeTruthy();
    });
  });
});
