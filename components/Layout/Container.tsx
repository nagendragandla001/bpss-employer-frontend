import React from 'react';
import PropTypes from 'prop-types';

const Container: React.FunctionComponent = (props) => {
  const { children } = props;
  return (
    <div className="container">
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Container;
