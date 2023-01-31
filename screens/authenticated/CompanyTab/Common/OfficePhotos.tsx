import React, { useState, useEffect } from 'react';
import Upload from 'antd/lib/upload';
import { uploadPhotoAPI, deletePhotoApi, patchOrgDetails } from 'service/organization-service';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import { pushClevertapEvent } from 'utils/clevertap';
import CustomImage from 'components/Wrappers/CustomImage';

interface OfficePhotosI{
  url:string;
  uid:number;
}
interface photosI{
  image:string,
  id:number
}
interface PropsI{
  id:string,
  photos:Array<photosI>
  handlepatch:(any)=>void;

}
const OfficePhotos = (props:PropsI):JSX.Element => {
  const {
    photos, id, handlepatch,
  } = props;

  const officepic = [] as Array<OfficePhotosI>;
  const [productPic, setproductPic] = useState(officepic) as any;
  const [loader, setLoader] = useState(false);
  const initialize = ():void => {
    if (photos) {
      photos.map((img) => {
        officepic.push({ url: img.image, uid: img.id });
        return null;
      });
      setproductPic(officepic);
    }
  };
  useEffect(() => {
    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  // console.log(productPic);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const dummyRequest = ():void => {};
  const handleChange = async (e) :Promise<void> => {
    if (e && e.file.status !== 'removed') {
      const { file } = e;
      setLoader(true);
      // const fd = new FormData();

      // fd.append('id', id);
      // fd.append('file', file.originFileObj);
      const res = await uploadPhotoAPI(id, file.originFileObj);

      e.fileList[e.fileList.length - 1].uid = res.id;
      e.fileList[e.fileList.length - 1].url = res.base_url + res.path;
      e.fileList[e.fileList.length - 1].status = 'done';
      e.fileList[e.fileList.length - 1].key = res.id;
      setproductPic(e.fileList);

      const obj = { photos: productPic };
      await patchOrgDetails(obj, id);
      handlepatch(productPic);
      pushClevertapEvent('Product Photos', { Type: 'Upload' });
      // console.log(response);
    }

    setLoader(false);
  };
  const handleRemove = async (pic):Promise<void> => {
    // console.log(pic.uid);
    const res = await deletePhotoApi(pic.uid);

    if (res.status === 204 || res.status === 200) {
      const newArry = productPic.filter((x) => x.uid !== pic.uid);
      setproductPic(newArry);

      const obj = { photos: newArry };
      const response = await patchOrgDetails(obj, id);
      // handlepatch(productPic);
      pushClevertapEvent('Product Photos', { Type: 'Delete' });
    }
  };

  const uploadButton = (
    <div>
      {loader ? <LoadingOutlined /> : <CustomImage src="/svgs/upload.svg" width={20} height={18} alt="upload" />}
      <div className="ct-ant-upload-text">Upload</div>
    </div>
  );
  return (
    <Upload
      customRequest={dummyRequest}
      listType="picture-card"
      fileList={productPic}
      onChange={handleChange}
      onRemove={handleRemove}

    >
      {productPic.length > 6 ? null : uploadButton}
    </Upload>
  );
};
export default OfficePhotos;
