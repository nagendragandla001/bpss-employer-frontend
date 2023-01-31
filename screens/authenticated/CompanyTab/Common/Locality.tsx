/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-nested-ternary */
import * as React from 'react';
import Popover from 'antd/lib/popover';

interface citiesI{
  id:number;
  name:string;
}
const locations = (cities:Array<citiesI>):JSX.Element => (
  <div>
    <span>
      {cities ? (
        cities.length < 3 ? (
          <>
            {cities.length === 0 ? (

              <span>-</span>

            ) : (
              <div>
                {cities.map((record, index, arr) => (
                  <span key={record.id}>
                    {record.name}

                    {index !== arr.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>

            )}
          </>
        ) : (
          <div>
            <span>

              <span>
                {cities && cities.slice(0, 2).map((record, index, arr) => (
                  <span key={record.id}>
                    {record.name}

                    {index !== arr.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </span>

              <Popover
                content={cities.map((e) => (
                  <p key={e.id}>{e.name}</p>
                ))}
              >
                <a className="ct-desktop-popover">
                  +
                  {cities.length - 2}

                  <span style={{ marginLeft: '0.2rem', color: '#0038c0' }}>more</span>
                </a>
              </Popover>

            </span>
          </div>
        )) : null}
    </span>
  </div>
);
export default locations;
