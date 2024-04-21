import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'ngagra-app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  template: `
    <ag-grid-angular
      style="width: 100%; height: 500px;"
      class="ag-theme-alpine"
      [gridOptions]="gridOptions"
      [columnDefs]="columnDefs"
      [rowData]="rowData"
    >
    </ag-grid-angular>
  `,
  styles: [],
})
export class AppComponent {
  protected readonly gridOptions = {
    defaultColDef: {
      cellRenderer: 'heavyCellRenderer',
      cellRendererParams: {
        // params for your heavy cell renderer
      },
    },
  };

  // Define column definitions
  protected readonly columnDefs = [
    { field: 'fundName' },
    { field: 'ticker' },
    { field: 'assetClass' },
    { field: 'totalAssets' },
    { field: 'yield' },
    { field: 'price' },
    { field: 'fundFlows' },
    { field: 'returnYTD' },
    { field: 'return1Year' },
    { field: 'return3Year' },
  ];

  // Define row data
  protected readonly rowData = [
    // Add your row data here
  ];

  createMockData(count: number) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        fundName: `Fund ${i}`,
        ticker: `Ticker ${i}`,
        assetClass: `Asset Class ${i}`,
        totalAssets: `Total Assets ${i}`,
        yield: `Yield ${i}`,
        price: `Price ${i}`,
        fundFlows: `Fund Flows ${i}`,
        returnYTD: `Return YTD ${i}`,
        return1Year: `Return 1 Year ${i}`,
        return3Year: `Return 3 Year ${i}`,
      });
    }
    return data;
  }
}
