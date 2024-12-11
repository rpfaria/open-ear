import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NoteEvent } from '../../../../services/player.service';
import { InfoPanelComponent } from '../../../../shared/components/shared-components/info-panel/info-panel.component';
import { PlayOnClickDirective } from '../../../../shared/components/shared-components/play-on-click.directive';
import { OneOrMany, toNoteNumber } from '../../../utility';
import { NoteNumberOrName } from '../../../utility/music/notes/NoteNumberOrName';
import {
  NoteDescriptor,
  noteDescriptorList,
} from '../APMExercise';

@Component({
  selector: 'app-interval-exercise-explanation',
  templateUrl: './apm-exercise-explanation.component.html',
  standalone: true,
  imports: [InfoPanelComponent, IonicModule, PlayOnClickDirective],
})
export class APMExerciseExplanationComponent {
  readonly NoteDescriptorList: (NoteDescriptor & {
    toPlay: OneOrMany<OneOrMany<NoteNumberOrName> | NoteEvent>;
  })[] = noteDescriptorList.map((note) => ({
    ...note,
    toPlay: ['C4', toNoteNumber('C4') + note.noteNumber],
  }));
}
