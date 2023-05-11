import css from 'styled-jsx/css'

export default css.global`
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  html,
  body {
    overflow-x: hidden;
  }

  body {
    color: var(--tg-theme-text-color) !important;
    background: var(--tg-theme-bg-color) !important;
  }

  a {
    color: var(--tg-theme-link-color) !important;
    text-decoration: none;
  }

  button {
    background-color: var(--tg-theme-bg-color) !important;
    color: var(--tg-theme-button-text-color) !important;
  }

  input {
    background-color: var(--tg-theme-secondary-bg-color) !important;
    color: var(--tg-theme-text-color) !important;
  }

  @media (prefers-color-scheme: dark) {
    html {
      color-scheme: var(--tg-color-scheme);
    }
  }

  /* ! * https: //github.com/arqex/react-datetime

*/
  .rdt {
    position: relative;
  }

  .rdtPicker {
    display: none;
    position: absolute;
    min-width: 250px;
    padding: 4px;
    margin-top: 1px;
    z-index: 99999 !important;
    background: var(--tg-theme-secondary-bg-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #f9f9f9;
  }

  .rdtOpen .rdtPicker {
    display: block;
  }

  .rdtStatic .rdtPicker {
    box-shadow: none;
    position: static;
  }

  .rdtPicker .rdtTimeToggle {
    text-align: center;
  }

  .rdtPicker table {
    width: 100%;
    margin: 0;
  }

  .rdtPicker td,
  .rdtPicker th {
    text-align: center;
    height: 28px;
  }

  .rdtPicker td {
    cursor: pointer;
  }

  .rdtPicker td.rdtDay:hover,
  .rdtPicker td.rdtHour:hover,
  .rdtPicker td.rdtMinute:hover,
  .rdtPicker td.rdtSecond:hover,
  .rdtPicker .rdtTimeToggle:hover {
    background: var(--tg-theme-secondary-bg-color);
    cursor: pointer;
  }

  .rdtPicker td.rdtOld,
  .rdtPicker td.rdtNew {
    color: #999999;
  }

  .rdtPicker td.rdtToday {
    position: relative;
  }

  .rdtPicker td.rdtToday:before {
    content: '';
    display: inline-block;
    border-left: 7px solid transparent;
    border-bottom: 7px solid var(--tg-theme-button-color);
    border-top-color: rgba(0, 0, 0, 0.2);
    position: absolute;
    bottom: 4px;
    right: 4px;
  }

  .rdtPicker td.rdtActive,
  .rdtPicker td.rdtActive:hover {
    background-color: var(--tg-theme-button-color);
    color: var(--tg-theme-button-text-color);
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  }

  .rdtPicker td.rdtActive.rdtToday:before {
    border-bottom-color: #fff;
  }

  .rdtPicker td.rdtDisabled,
  .rdtPicker td.rdtDisabled:hover {
    background: none;
    color: #999999;
    cursor: not-allowed;
  }

  .rdtPicker td span.rdtOld {
    color: #999999;
  }

  .rdtPicker td span.rdtDisabled,
  .rdtPicker td span.rdtDisabled:hover {
    background: none;
    color: #999999;
    cursor: not-allowed;
  }

  .rdtPicker th {
    border-bottom: 1px solid #f9f9f9;
  }

  .rdtPicker .dow {
    width: 14.2857%;
    border-bottom: none;
    cursor: default;
  }

  .rdtPicker th.rdtSwitch {
    width: 100px;
  }

  .rdtPicker th.rdtNext,
  .rdtPicker th.rdtPrev {
    font-size: 21px;
    vertical-align: top;
  }

  .rdtPrev span,
  .rdtNext span {
    display: block;
    -webkit-touch-callout: none;
    /* iOS Safari */
    -webkit-user-select: none;
    /* Chrome/Safari/Opera */
    -khtml-user-select: none;
    /* Konqueror */
    -moz-user-select: none;
    /* Firefox */
    -ms-user-select: none;
    /* Internet Explorer/Edge */
    user-select: none;
  }

  .rdtPicker th.rdtDisabled,
  .rdtPicker th.rdtDisabled:hover {
    background: none;
    color: #999999;
    cursor: not-allowed;
  }

  .rdtPicker thead tr:first-of-type th {
    cursor: pointer;
  }

  .rdtPicker thead tr:first-of-type th:hover {
    background: var(--tg-theme-secondary-bg-color);
  }

  .rdtPicker tfoot {
    border-top: 1px solid #f9f9f9;
  }

  .rdtPicker button {
    border: none;
    background: none;
    cursor: pointer;
  }

  .rdtPicker button:hover {
    background-color: var(--tg-theme-secondary-bg-color);
  }

  .rdtPicker thead button {
    width: 100%;
    height: 100%;
  }

  td.rdtMonth,
  td.rdtYear {
    height: 50px;
    width: 25%;
    cursor: pointer;
  }

  td.rdtMonth:hover,
  td.rdtYear:hover {
    background: var(--tg-theme-secondary-bg-color);
  }

  .rdtCounters {
    display: inline-block;
  }

  .rdtCounters > div {
    float: left;
  }

  .rdtCounter {
    height: 100px;
  }

  .rdtCounter {
    width: 40px;
  }

  .rdtCounterSeparator {
    line-height: 100px;
  }

  .rdtCounter .rdtBtn {
    height: 40%;
    line-height: 40px;
    cursor: pointer;
    display: block;

    -webkit-touch-callout: none;
    /* iOS Safari */
    -webkit-user-select: none;
    /* Chrome/Safari/Opera */
    -khtml-user-select: none;
    /* Konqueror */
    -moz-user-select: none;
    /* Firefox */
    -ms-user-select: none;
    /* Internet Explorer/Edge */
    user-select: none;
  }

  .rdtCounter .rdtBtn:hover {
    background: var(--tg-theme-secondary-bg-color);
  }

  .rdtCounter .rdtCount {
    height: 20%;
    font-size: 1.2em;
  }

  .rdtMilli {
    vertical-align: middle;
    padding-left: 8px;
    width: 48px;
  }

  .rdtMilli input {
    width: 100%;
    font-size: 1.2em;
    margin-top: 37px;
  }

  .rdtTime td {
    cursor: default;
  }
`
