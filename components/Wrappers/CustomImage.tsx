/* eslint-disable react/require-default-props */
import React from 'react';
import Image from 'next/image';

type PropsType = {
  src: string;
  height?: number;
  width?: number | string;
  alt: string;
  className?: string | null;
  layout?: boolean;
  loading?: 'lazy' | 'eager' | undefined;
  quality?: number;
  placeholder?:any
}

const CustomImage = (props: PropsType): JSX.Element => {
  const {
    src, width, height, alt, className, layout, loading, quality, placeholder,
  } = props;

  const contentfulLoader = (): string => {
    if (width) {
      const params = [`w=${width}`, `q=${quality || 80}`];
      return `${src}?${params.join('&')}`;
    }
    return src;
  };

  return (
    layout ? (
      <Image
        src={src}
        alt={alt}
        layout="fill" // TODO - Tech Task: Need to update this for "fixed | responsive | intrinsic
        loader={contentfulLoader}
        className={className || ''}
        loading={loading}
        placeholder={placeholder || 'empty'}
        unoptimized
      />
    )
      : (
        <Image
          src={src}
          alt={alt}
          width={width || 20}
          height={height || 20}
          loader={contentfulLoader}
          className={className || ''}
          loading={loading}
          unoptimized
        />
      )
  );
};

export default CustomImage;
