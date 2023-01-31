import React from 'react';
import PropTypes from 'prop-types';

const IconContainer: React.FunctionComponent = (props) => {
  const { children } = props;
  return (
    <span style={{ padding: '2px', display: 'inline-flex', verticalAlign: 'middle' }}>
      {children}
    </span>
  );
};

IconContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default IconContainer;
