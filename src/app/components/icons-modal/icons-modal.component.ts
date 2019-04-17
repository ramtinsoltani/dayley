import { Component, Output, EventEmitter } from '@angular/core';
import iconsList from '@app/config/icons';
import _ from 'lodash';

@Component({
  selector: 'app-icons-modal',
  templateUrl: './icons-modal.component.html',
  styleUrls: ['./icons-modal.component.scss']
})
export class IconsModalComponent {

  @Output('onselect')
  public onSelect: EventEmitter<string> = new EventEmitter<string>();

  public icons: string[] = iconsList;

  constructor() { }

  public filterIcons(query: string): void {

    this.icons = _.filter(iconsList, (name: string) => {

      return (new RegExp(query.toLowerCase().trim(), 'ig')).test(name);

    });

  }

  public selectIcon(index: number): void {

    this.onSelect.emit(this.icons[index]);
    this.icons = iconsList;

  }

}
