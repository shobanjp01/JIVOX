import {
  Component,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { MatTable } from '@angular/material';
import { HttpClient } from '@angular/common/http';

export interface elementData {
  id: string;
  ruleName: string;
  action: any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) { }
  @ViewChild('table') table: MatTable<elementData>;
  displayedColumns: string[] = ['action', 'sNo', 'id', 'ruleName'];
  dataSource: elementData[] = [];
  activePageDataChunk: any = [];
  pageSize: number = 25;
  currentPageIndex: number = 0;
  firstCut = this.currentPageIndex * this.pageSize;

  ngOnInit() {
    this.getData();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  dropTable(event: CdkDragDrop<elementData[]>) {
    const prevIndex = this.dataSource.findIndex(d => d === event.item.data);
    moveItemInArray(this.dataSource, prevIndex, this.firstCut + event.currentIndex);
    this.reRenderPage();
    this.table.renderRows();
  }

  deleteRowData(index) {
    this.dataSource.splice(this.firstCut + index, 1);
    this.reRenderPage();
  }

  cloneRowData(data, index) {
    this.dataSource.splice(this.firstCut + index + 1, 0, data);
    this.reRenderPage();
  }

  reRenderPage() {
    let secondCut = this.firstCut + this.pageSize;
    this.activePageDataChunk = this.dataSource.slice(this.firstCut, secondCut);
  }

  getData() {
    this.http.get('http://jivoxdevuploads.s3.amazonaws.com/eam-dev/files/44939/Rule JSON.json')
      .subscribe(res => {
        this.dataSource = res['data'].map(({ id, ruleName }) => ({
          id,
          ruleName
        }));
        this.activePageDataChunk = this.dataSource.slice(0, this.pageSize)
      })
  }

  onPageChanged(e) {
    this.currentPageIndex = e.pageIndex;
    this.firstCut = e.pageIndex * e.pageSize;
    let secondCut = this.firstCut + e.pageSize;
    this.activePageDataChunk = this.dataSource.slice(this.firstCut, secondCut);
  }
}
