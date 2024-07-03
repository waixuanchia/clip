import {
  AfterContentInit,
  Component,
  ContentChildren,
  QueryList,
} from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.css'],
})
export class TabsContainerComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent> =
    new QueryList();
  ngAfterContentInit(): void {
    let activeTabs = this.tabs.filter((tab) => tab.active == true);

    if (activeTabs.length <= 0) {
      let activeTab = this.tabs.first;
      this.selectTab(activeTab);
    }
  }

  selectTab(tab: TabComponent) {
    this.tabs.forEach((tab) => {
      tab.active = false;
    });

    tab.active = true;
  }
}
