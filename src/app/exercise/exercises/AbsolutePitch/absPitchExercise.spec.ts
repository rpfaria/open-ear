import { testExercise } from '../testing-utility/test-exercise.spec';
import { expectedTonalExerciseSettingsDescriptors } from '../utility/exerciseAttributes/tonalExercise.spec';
import { APitchSettings, absPitchExercise } from './absPitchExercise';

describe(absPitchExercise.name, () => {
  const context = testExercise<APitchSettings>({
    getExercise: absPitchExercise,
    settingDescriptorList: [
      ...expectedTonalExerciseSettingsDescriptors,
      'Included Scale Degrees',
      'Display',
      'Range',
      'Number of notes',
      'Number of voices',
      'Harmonic Intervals',
      'Play Resolution',
    ],
  });

  it(`getQuestion with multiple voices`, () => {
    const defaultSettings = context.exercise.getCurrentSettings?.();
    const settings: APitchSettings = {
      ...defaultSettings!,
      key: 'C',
      newKeyEvery: 1,
    };

    for (let range of ['high', 'middle', 'bass', 'contrabass'] as const) {
      for (let numberOfVoices of [2, 3] as const) {
        context.exercise.updateSettings?.({
          ...settings,
          notesRange: range,
          numberOfVoices,
        });
        expect(() => context.exercise.getQuestion()).not.toThrow();
      }
    }
  });
});
