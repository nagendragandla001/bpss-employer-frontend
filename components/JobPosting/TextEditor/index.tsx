import React from 'react';
import { useMediaQuery } from 'react-responsive';

const ReactQuill = typeof window === 'object' ? require('react-quill') : () => false;

require('components/JobPosting/TextEditor/TextEditor.less');

const mobileToolbar = [
  'bold', 'italic', 'underline',
  { list: 'bullet' },
  { list: 'ordered' },
];

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'indent',
];

const tabToolbar = [
  'bold', 'italic', 'underline',
  { list: 'bullet' },
  { list: 'ordered' },
  { indent: '-1' },
  { indent: '+1' },
];

type Props = {
  value: string;
  onChange: (content: any) => void;
};

const TextEditor: React.FC<Props> = (props: Props) => {
  const { value, onChange } = props;
  const isMobile = useMediaQuery({ query: '(max-width: 991px)' });

  const modules = {
    toolbar: isMobile ? mobileToolbar : tabToolbar,
    clipboard: {
      matchVisual: false,
    },
  };

  const onChangeHandler = (content, source): void => {
    if (source === 'user') {
      onChange(content);
    }
  };

  return (
    <ReactQuill
      className="custom-quill-editor"
      theme="snow"
      modules={modules}
      formats={formats}
      value={value || ' '}
      onChange={(content, delta, source, editor): void => onChangeHandler(content, source)}
    />
  );
};

export default TextEditor;
