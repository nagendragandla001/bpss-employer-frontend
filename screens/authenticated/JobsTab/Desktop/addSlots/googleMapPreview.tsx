import React, { memo } from 'react';
import {
  withGoogleMap, GoogleMap, Marker,
} from 'react-google-maps';
import Button from 'antd/lib/button';
import { isMobile } from 'mobile-device-detect';
import CustomImage from 'components/Wrappers/CustomImage';

require('screens/authenticated/JobsTab/Desktop/addSlots/googleMapPreview.less');

type updateObjectType={
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedAddress: Record<string, any>;
  mapPosition: {
    lat: number;
    lng: number;
  };
  displayValue: string;
}

interface GoogleMapComponentprops{
  lat: number;
  lng: number;
  showCurrentLocationBtn:boolean;
  getUserLocation: ()=>void;
  updateNewAddress: (updateObj:updateObjectType) => void;
}

const GoogleMapComponent = (props: GoogleMapComponentprops): JSX.Element => {
  const {
    updateNewAddress, lat, lng,
  } = props;
  const onMarkerDragEnd = (event): void => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    if (window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gecoderObject = new (window as any).google.maps.Geocoder();

      if (gecoderObject) {
        gecoderObject.geocode({ location: { lat: newLat, lng: newLng } },
          (predictions, statusOfRequest) => {
            if (statusOfRequest === 'OK' && predictions.length > 0) {
              updateNewAddress({
                selectedAddress: {
                  placeId: predictions[0].place_id,
                  geometry: predictions[0].geometry,
                  address: predictions[0].formatted_address,
                },
                mapPosition: {
                  lat: predictions[0].geometry.location.lat(),
                  lng: predictions[0].geometry.location.lng(),
                },
                displayValue: predictions[0].formatted_address,
              });
            }
          });
      }
    }
  };

  const AsyncMap = withGoogleMap(
    () => (
      <GoogleMap
        defaultZoom={15}
        defaultCenter={{ lat, lng }}
        options={{
          disableDefaultUI: false,
        }}
      >
        {/* Marker */}
        <Marker
          position={{ lat, lng }}
          draggable
          onDragEnd={onMarkerDragEnd}
        />
      </GoogleMap>
    ),
  );
  let map;
  if (props.lat !== undefined) {
    map = (
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Overlay over the Map, when no location is set */}
        <div className={props.showCurrentLocationBtn ? 'google-map-container-overlay' : ''}>
          {props.showCurrentLocationBtn ? (
            <Button
              onClick={():void => props.getUserLocation()}
              className="location-btn"
              icon={(
                <CustomImage
                  src="/svgs/gps-fixed-24-px.svg"
                  alt="second"
                  width={24}
                  height={24}
                  className="margin-excel"
                />
              )}
            >
              Set Current Location
            </Button>
          ) : null }
        </div>
        <AsyncMap
          containerElement={
            <div style={{ height: isMobile ? 200 : 320, width: '100%', borderRadius: '4px' }} />
          }
          mapElement={
            <div style={{ height: isMobile ? 200 : 320, width: '100%', borderRadius: '4px' }} />
          }
        />
      </div>
    );
  } else {
    map = <div style={{ height: isMobile ? 200 : 320 }} />;
  }
  return map;
};

const checkForRender = (
  prevProps: Readonly<GoogleMapComponentprops>,
  nextProps: Readonly<GoogleMapComponentprops>,
): boolean => prevProps.lat === nextProps.lat
      && prevProps.lng === nextProps.lng;

export default memo(GoogleMapComponent, checkForRender);
