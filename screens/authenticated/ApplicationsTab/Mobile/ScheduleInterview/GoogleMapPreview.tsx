import React, { useEffect, useState, memo } from 'react';
import {
  withGoogleMap, GoogleMap,
} from 'react-google-maps';
import { Button, Row, Col } from 'antd';
import { FormInstance } from 'antd/lib/form';
import CustomImage from 'components/Wrappers/CustomImage';

require('screens/authenticated/JobsTab/Desktop/addSlots/googleMapPreview.less');

interface GoogleMapComponentprops{
  lat: number;
  lng: number;
  setAddressState: any;
  form: FormInstance;
  btn:boolean;
  getUserLocation: any;
}

interface GoogleMapState{
  mapPosition: {
    lat: number;
    lng: number;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  GecoderService: any;
}
const GoogleMapComponent = (props: GoogleMapComponentprops): JSX.Element => {
  const [state, setState] = useState<GoogleMapState>({
    mapPosition: {
      lat: props.lat,
      lng: props.lng,
    },
    GecoderService: {},
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gecoderObject = new (window as any).google.maps.Geocoder();
    setState((prevState) => ({
      ...prevState,
      GecoderService: gecoderObject,
    }));
  }, []);

  if (state.mapPosition.lat !== props.lat && state.mapPosition.lng !== props.lng) {
    setState((prevState) => ({
      ...prevState,
      mapPosition: {
        lat: props.lat,
        lng: props.lng,
      },
    }));
  }

  const AsyncMap = withGoogleMap(
    () => (
      <GoogleMap
        defaultZoom={15}
        defaultCenter={{ lat: state.mapPosition.lat, lng: state.mapPosition.lng }}
        options={{
          disableDefaultUI: false,

        }}
        // onClick={() => {}}

      >
        {/* Marker */}

        {/* <Marker
          draggable
          onDragEnd={onMarkerDragEnd}
          position={{ lat: state.mapPosition.lat, lng: state.mapPosition.lng }}
        />

        <Marker /> */}
      </GoogleMap>
    ),
  );
  let map;
  if (props.lat !== undefined) {
    map = (
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div className={props.btn ? 'google-map-container-overlay' : ''}>
          {props.btn ? (
            <Button
              onClick={():void => props.getUserLocation()}
              className="location-btn"
            >
              <Row>
                <Col>
                  <CustomImage
                    src="/svgs/gps-fixed-24-px.svg"
                    alt="second"
                    width={24}
                    height={24}
                    className="margin-excel"
                  />
                </Col>
                &nbsp;
                <Col />
                Set Current Location
              </Row>

            </Button>
          ) : null }
        </div>

        <AsyncMap
          containerElement={
            <div style={{ height: '200px', width: '100%' }} />
          }
          mapElement={
            <div style={{ height: '200px', width: '100%' }} />
          }
        />
      </div>
    );
  } else {
    map = <div style={{ height: '200px' }} />;
  }
  return map;
};

const checkForRender = (
  prevProps: Readonly<GoogleMapComponentprops>,
  nextProps: Readonly<GoogleMapComponentprops>,
): boolean => prevProps.lat === nextProps.lat
      && prevProps.lng === nextProps.lng;
export default memo(GoogleMapComponent, checkForRender);
