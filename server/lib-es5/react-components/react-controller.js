'use strict';

/**
 * Created by denmanm1 on 3/31/16.
 */

var React = require('react');
var ReactDOM = require('react-dom');

module.exports = function (Parent, parentProps, Child, childDataArray, documentId) {

    var children = childDataArray.map(function (props) {

        console.log('childDataArray => ', props);

        return React.createElement(Child, props);
    });

    ReactDOM.render(React.createElement(
        Parent,
        parentProps,
        children
    ), document.getElementById(documentId));
};