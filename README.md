# ngx-hana-nameserver-history-viewer

[![npm](https://img.shields.io/npm/v/ngx-hana-nameserver-history-viewer.svg?style=flat-square)](https://www.npmjs.com/package/ngx-hana-nameserver-history-viewer) [![npm downloads](https://img.shields.io/npm/dm/ngx-hana-nameserver-history-viewer.svg)](https://www.npmjs.com/package/ngx-hana-nameserver-history-viewer) [![Travis](https://img.shields.io/travis/ckyycc/ngx-hana-nameserver-history-viewer.svg?style=flat-square)](https://travis-ci.org/ckyycc/ngx-hana-nameserver-history-viewer) [![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/ckyycc/ngx-hana-nameserver-history-viewer/blob/master/LICENSE)

An Angular 7 module of SAP HANA nameserver history viewer. Supports MDC, different timezone and zoom-in.\
For Angular 6 support please use older versions (<= [v1.0.15](https://github.com/ckyycc/ngx-hana-nameserver-history-viewer/tree/1.0.15) ).

## Demo

#### Check out the _[LIVE DEMO](https://ckyycc.github.io/ngx-hana-nameserver-history-viewer/)_ for more information!

![small_demo_nameserver_history_viewer](https://raw.githubusercontent.com/ckyycc/ngx-hana-nameserver-history-viewer/master/src/demo/small-demo.gif)


## Installation
To use ngx-hana-nameserver-history-viewer in your project install it via [npm](https://www.npmjs.com/package/ngx-hana-nameserver-history-viewer):
```
npm install ngx-hana-nameserver-history-viewer --save
```

### Requirements

The library depends on [ngx-selection-table](https://github.com/ckyycc/ngx-selection-table), [ngx-dropdown-list](https://github.com/ckyycc/ngx-dropdown-list), [moment-timezone](https://github.com/moment/moment-timezone), [papaparse](https://github.com/mholt/PapaParse), [ng-pick-datetime](https://github.com/DanielYKPan/date-time-picker), [chart.js](https://github.com/chartjs/Chart.js) and [hammer.js](https://github.com/hammerjs/hammer.js/).

The only file required is the ng-pick-datetime `picker.min.css` file:

##### 1. Include the `picker.min.css` file in the `angular.json` file:

```
{
  ...
    "styles": [
      "../node_modules/ng-pick-datetime/assets/style/picker.min.css",
      ...
    ],
  ...
}
```

##### 2. Or import the `picker.min.css` in your styles.css

```css
@import "~ng-pick-datetime/assets/style/picker.min.css";
```

## Usage

### Importing The 'ngx-hana-nameserver-history-viewer' Module
```TypeScript
//Import the library
import { NameserverHistoryModule } from 'ngx-hana-nameserver-history-viewer';

@NgModule({
  declarations: [...],
  imports: [
    NameserverHistoryModule, // Include the library in the imports section
    ...
  ],
  providers: [],
  bootstrap: [...]
})
export class AppModule { }

```
### Enabling nameserverh history viewer
```HTML
<ngx-hana-nameserver-history-viewer
  [defaultSelectedItems]="['indexserverMemUsed', 'mvccNum']"
  [hideMeasureColumns]="['Sum', 'Last']"
  [maxRowsLimitation]="100000"
  [showInstruction]="true"
  [timezone]="'America/Vancouver'">
</ngx-hana-nameserver-history-viewer>
```

## Parameters
Name  | Description | Example | 
------------- | ------------- | -------------
defaultSelectedItems  | Item(s) that will be selected by default on the chart. | [defaultSelectedItems]="['indexserverMemUsed', 'mvccNum']"
hideMeasureColumns  | Measure(s) that will be hidden from selection table (controlling area) of the chart. | [hideMeasureColumns]="['Sum', 'Last']"
maxRowsLimitation  | The maximum rows that will be loaded from the selected nameserver history file. **Web page might crash _(OOM of JavaScript VM)_ if this number is too high _(eg: > 500000)_** | [maxRowsLimitation]="100000"
showInstruction  | Flag of instruction | [showInstruction]="true"
timezone  | Timezone name, can't be abbreviation | [timezone]="'America/Vancouver'"


Todo
----
* ~~Support Angular 7~~
* Reduce memory usage
* ...

## License
 [MIT](/LICENSE)
