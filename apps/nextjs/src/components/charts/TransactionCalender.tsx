import { ResponsiveCalendar } from '@nivo/calendar'
const data = [
  {
    value: 97,
    day: '2016-05-01',
  },
  {
    value: 272,
    day: '2017-10-18',
  },
  {
    value: 207,
    day: '2017-12-11',
  },
  {
    value: 132,
    day: '2017-02-04',
  },
  {
    value: 176,
    day: '2017-07-31',
  },
  {
    value: 76,
    day: '2016-02-07',
  },
  {
    value: 217,
    day: '2017-05-29',
  },
  {
    value: 86,
    day: '2018-07-04',
  },
  {
    value: 304,
    day: '2017-08-22',
  },
  {
    value: 107,
    day: '2017-08-24',
  },
  {
    value: 310,
    day: '2016-06-14',
  },
  {
    value: 323,
    day: '2016-09-17',
  },
  {
    value: 91,
    day: '2016-10-27',
  },
  {
    value: 360,
    day: '2018-07-29',
  },
  {
    value: 23,
    day: '2016-07-06',
  },
  {
    value: 359,
    day: '2018-01-24',
  },
  {
    value: 359,
    day: '2017-05-18',
  },
  {
    value: 312,
    day: '2018-06-14',
  },
  {
    value: 246,
    day: '2018-02-07',
  },
  {
    value: 223,
    day: '2015-04-10',
  },
  {
    value: 265,
    day: '2015-05-01',
  },
  {
    value: 290,
    day: '2018-02-13',
  },
  {
    value: 275,
    day: '2016-09-02',
  },
  {
    value: 204,
    day: '2016-03-05',
  },
  {
    value: 105,
    day: '2017-12-29',
  },
  {
    value: 210,
    day: '2016-01-23',
  },
  {
    value: 320,
    day: '2016-02-03',
  },
  {
    value: 259,
    day: '2017-09-29',
  },
  {
    value: 42,
    day: '2017-03-18',
  },
  {
    value: 353,
    day: '2018-07-17',
  },
  {
    value: 187,
    day: '2015-06-30',
  },
  {
    value: 77,
    day: '2016-01-09',
  },
  {
    value: 177,
    day: '2016-06-07',
  },
  {
    value: 200,
    day: '2016-07-08',
  },
  {
    value: 372,
    day: '2016-10-12',
  },
  {
    value: 300,
    day: '2016-01-10',
  },
  {
    value: 236,
    day: '2016-09-05',
  },
  {
    value: 9,
    day: '2016-05-24',
  },
  {
    value: 398,
    day: '2018-05-31',
  },
  {
    value: 272,
    day: '2016-10-19',
  },
  {
    value: 371,
    day: '2016-09-24',
  },
  {
    value: 135,
    day: '2018-07-11',
  },
  {
    value: 233,
    day: '2017-04-17',
  },
  {
    value: 283,
    day: '2015-04-25',
  },
  {
    value: 157,
    day: '2015-08-31',
  },
  {
    value: 176,
    day: '2017-03-01',
  },
  {
    value: 38,
    day: '2016-07-14',
  },
  {
    value: 73,
    day: '2018-05-25',
  },
  {
    value: 5,
    day: '2018-06-24',
  },
  {
    value: 384,
    day: '2015-07-30',
  },
  {
    value: 146,
    day: '2017-04-22',
  },
  {
    value: 362,
    day: '2015-06-15',
  },
  {
    value: 49,
    day: '2016-03-07',
  },
  {
    value: 269,
    day: '2015-08-23',
  },
  {
    value: 37,
    day: '2016-07-22',
  },
  {
    value: 178,
    day: '2015-07-08',
  },
  {
    value: 358,
    day: '2016-11-07',
  },
  {
    value: 78,
    day: '2016-11-18',
  },
  {
    value: 398,
    day: '2015-04-20',
  },
  {
    value: 58,
    day: '2016-08-28',
  },
  {
    value: 220,
    day: '2015-05-14',
  },
  {
    value: 1,
    day: '2017-12-21',
  },
  {
    value: 49,
    day: '2018-01-19',
  },
  {
    value: 124,
    day: '2017-01-07',
  },
  {
    value: 123,
    day: '2016-05-15',
  },
  {
    value: 192,
    day: '2016-02-28',
  },
  {
    value: 68,
    day: '2017-11-06',
  },
  {
    value: 399,
    day: '2016-06-08',
  },
  {
    value: 82,
    day: '2015-08-03',
  },
  {
    value: 144,
    day: '2016-11-01',
  },
  {
    value: 241,
    day: '2017-04-03',
  },
  {
    value: 300,
    day: '2017-04-15',
  },
  {
    value: 377,
    day: '2017-05-21',
  },
  {
    value: 93,
    day: '2018-03-12',
  },
  {
    value: 232,
    day: '2017-05-11',
  },
  {
    value: 67,
    day: '2017-02-20',
  },
  {
    value: 97,
    day: '2017-07-15',
  },
  {
    value: 279,
    day: '2015-12-18',
  },
  {
    value: 394,
    day: '2017-10-26',
  },
  {
    value: 219,
    day: '2017-03-25',
  },
  {
    value: 43,
    day: '2015-07-06',
  },
  {
    value: 212,
    day: '2017-09-05',
  },
  {
    value: 78,
    day: '2015-10-10',
  },
  {
    value: 92,
    day: '2016-06-24',
  },
  {
    value: 185,
    day: '2017-12-23',
  },
  {
    value: 284,
    day: '2017-02-18',
  },
  {
    value: 25,
    day: '2016-03-13',
  },
  {
    value: 292,
    day: '2017-01-15',
  },
  {
    value: 282,
    day: '2017-05-17',
  },
  {
    value: 198,
    day: '2018-05-12',
  },
  {
    value: 172,
    day: '2018-02-09',
  },
  {
    value: 142,
    day: '2017-07-03',
  },
  {
    value: 340,
    day: '2015-10-23',
  },
  {
    value: 134,
    day: '2017-01-27',
  },
  {
    value: 216,
    day: '2017-09-17',
  },
  {
    value: 49,
    day: '2018-03-05',
  },
  {
    value: 327,
    day: '2018-02-18',
  },
  {
    value: 321,
    day: '2016-03-23',
  },
  {
    value: 17,
    day: '2018-06-08',
  },
  {
    value: 59,
    day: '2017-06-03',
  },
  {
    value: 343,
    day: '2015-09-23',
  },
  {
    value: 146,
    day: '2017-02-02',
  },
  {
    value: 299,
    day: '2016-02-08',
  },
  {
    value: 234,
    day: '2018-04-21',
  },
  {
    value: 330,
    day: '2016-10-22',
  },
  {
    value: 328,
    day: '2016-07-13',
  },
  {
    value: 105,
    day: '2015-08-09',
  },
  {
    value: 26,
    day: '2017-08-04',
  },
  {
    value: 371,
    day: '2018-04-02',
  },
  {
    value: 126,
    day: '2015-05-31',
  },
  {
    value: 322,
    day: '2016-08-26',
  },
  {
    value: 92,
    day: '2018-06-30',
  },
]

export const TransactionCalender = () => (
  <ResponsiveCalendar
    data={data}
    from="2016-03-01"
    to="2016-05-12"
    emptyColor="#eeeeee"
    colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
    margin={{ right: 40, left: 40 }}
    yearSpacing={40}
    monthBorderColor="#ffffff"
    dayBorderWidth={2}
    dayBorderColor="#ffffff"
    legends={[
      {
        anchor: 'bottom-right',
        direction: 'row',
        translateY: 36,
        itemCount: 4,
        itemWidth: 42,
        itemHeight: 36,
        itemsSpacing: 14,
        itemDirection: 'right-to-left',
      },
    ]}
  />
)
