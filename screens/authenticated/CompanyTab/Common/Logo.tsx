import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import {
  Button, Popover, Upload,
} from 'antd';
import CustomImage from 'components/Wrappers/CustomImage';
import snackBar from 'components/Notifications';
import { isMobile } from 'mobile-device-detect';
import React, { useState } from 'react';
import { patchOrgDetails, photoUploadAPI } from 'service/organization-service';
import { pushClevertapEvent } from 'utils/clevertap';

interface PropsI{
  id:string,
  photos:string,
  source?:string,
  size:string,
  handlelogo:(any)=>void;
}

const OfficePhotos = (props:PropsI):JSX.Element => {
  const {
    photos, id, size, handlelogo, source,
  } = props;

  const [imageurl, setimageurl] = useState(photos);
  const [loader, setLoader] = useState(false);

  const dummyRequest = ():void => {};
  const handleChange = async (e) :Promise<void> => {
    if (e && e.file.status !== 'removed') {
      const { file } = e;
      setLoader(true);
      if (file.originFileObj.size < 5000000) {
        const res = await photoUploadAPI(file.originFileObj);
        setimageurl(res.base_url + res.path);
        const path = res.base_url + res.path;
        const obj = { logo_url: path };
        await patchOrgDetails(obj, id);
        // console.log(response);
        if (photos.length !== 0) {
          pushClevertapEvent('Special Click', { Type: 'Update Logo', Source: `${source === 'modal' ? 'Modal' : 'Header'}` });
        } else {
          pushClevertapEvent('Special Click', { Type: 'Upload Logo', Source: `${source === 'modal' ? 'Modal' : 'Header'}` });
        }
        handlelogo(path);
      } else {
        snackBar({
          title: 'The uploaded image size is greater than 5MB',
          description: '',
          iconName: '',
          notificationType: 'error',
          placement: 'topRight',
          duration: 5,
        });
      }
    }
    setLoader(false);
  };

  const uploadButton = (
    <div>
      {loader ? <LoadingOutlined /> : (
        <Button
          type="default"
          icon={(
            <CustomImage
              src="/svgs/upload.svg"
              width={20}
              height={18}
              alt="upload"
            />
          )}
        />
      )}
      <div className="ct-ant-upload-text">Upload Logo</div>
    </div>
  );
  const logoStyle = ():string => {
    if (isMobile) {
      if (imageurl.length > 0) { return 'avatar-uploader m-ct-upload-picture-card'; }
      return 'avatar-uploader m-ct-upload-picture-card-empty';
    }
    if (imageurl.length > 0) { return 'avatar-uploader ct-upload-picture-card'; }
    return 'avatar-uploader ct-upload-picture-card-empty';
  };

  return (
    <Popover
      placement="bottom"
      overlayClassName="popover-des popover-background-grey"
      content={photos && photos.length === 0 ? 'Add Logo' : 'Update logo'}
      arrowPointAtCenter
    >
      <Upload
        name="avatar"
        listType="picture-card"
        className={logoStyle()}
        showUploadList={false}
        customRequest={dummyRequest}
        onChange={handleChange}
      >
        {imageurl ? (
          <img
            src={imageurl}
            alt="avatar"
            width={`${size}`}
            height={`${size}`}
            style={{ objectFit: 'contain' }}
          />
        ) : (
          uploadButton
        )}
      </Upload>
    </Popover>
  );
};
export default OfficePhotos;
