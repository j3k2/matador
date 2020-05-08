import React from 'react';
import request from 'superagent';
import { ResponsiveLine } from '@nivo/line'
import { format, sub } from 'date-fns'
import MatadorSearch from './MatadorSearch';

export default class MatadorChart extends React.Component {
  state = {
    data: []
  }

  getDataForSymbol = (symbol) => {
    const end = format(new Date(), 'yyyy-MM-dd');
    const start = format(sub(new Date(), { months: 1 }), 'yyyy-MM-dd');
    request.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${start}&to=${end}`)
      .then((res) => {
        if (res.body.historical) {
          const data = res.body.historical.map((obj) => {
            return {
              x: obj.date,
              y: obj.close
            }
          }).sort((a, b) => Date.parse(a.x) - Date.parse(b.x))

          this.setState({
            data: [...this.state.data, {
              id: res.body.symbol,
              data: data
            }]
          })
        } else {
          //not found
        }
      })
  }

  render() {
    return <div style={{ height: 480 }}>
      <MatadorSearch getDataForSymbol={this.getDataForSymbol}/>
      <ResponsiveLine
        data={this.state.data}
        margin={{ top: 50, right: 100, bottom: 50, left: 50 }}
        xScale={{
          type: 'time',
          format: '%Y-%m-%d'
        }}
        xFormat="time:%Y-%m-%d"
        enableSlices="x"
        sliceTooltip={({ slice }) => {
          return (
            <div
              style={{
                background: 'white',
                padding: '9px 12px',
                border: '1px solid black',
              }}
            >
              <div>
                {slice.points[0].data.xFormatted}
              </div>
              {slice.points.sort((a, b) => b.data.yFormatted - a.data.yFormatted).map(point => (
                <div
                  key={point.id}
                  style={{
                    color: point.serieColor,
                    padding: '3px 0px',
                  }}
                >
                  <strong>{point.serieId}</strong> ${point.data.yFormatted}
                </div>
              ))}
            </div>
          )
        }}
        axisBottom={{
          format: '%b %d',
          tickValues: 'every 2 days',
        }}
        axisLeft={{
          format: value =>
            `$${value}`
        }}
        colors={{ scheme: 'category10' }}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 6,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1
                }
              }
            ],
            onClick: (d) => {
              console.log(d);
            }
          }
        ]}
      >
      </ResponsiveLine></div>
  }
}