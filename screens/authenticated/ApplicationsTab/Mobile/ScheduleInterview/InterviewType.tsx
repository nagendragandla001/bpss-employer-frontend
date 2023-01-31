import React from 'react';
import {
  List, Avatar,
} from 'antd';
import RightOutlined from '@ant-design/icons/RightOutlined';

interface PropsModel {
  setinterviewTypeFormat: (type) => void;
  handleScreenChange: (type) => void;
  mode: string;
}

interface InterviewTypeModel {
  image: string;
  name: string;
  key: string;
}

const CommonTypes = [
  {
    image: '/svgs/facetoface.svg',
    name: 'Face to Face Interview',
    key: 'FACE',
  },
  {
    image: '/svgs/telephonic.svg',
    name: 'Telephonic Interview',
    key: 'TELE',
  },
];

const FacetoFace = [{
  image: '/svgs/video.svg',
  name: 'Video Interview',
  key: 'HANG_VID',
}];

const InterviewType = (props: PropsModel): JSX.Element => {
  const { setinterviewTypeFormat, handleScreenChange, mode = 'facetoface' } = props;

  const Types = mode === 'facetoface' ? [...CommonTypes, ...FacetoFace] : [...CommonTypes];

  return (
    <List
      dataSource={Types}
      renderItem={(item: InterviewTypeModel): JSX.Element => (
        <List.Item
          actions={[<RightOutlined className="right-arrow" />]}
          onClick={(): void => {
            setinterviewTypeFormat(item.key);
            handleScreenChange('first');
          }}
        >
          <List.Item.Meta
            avatar={<Avatar src={item.image} />}
            title={item.name}
          />
        </List.Item>
      )}
    />
  );
};

export default InterviewType;
