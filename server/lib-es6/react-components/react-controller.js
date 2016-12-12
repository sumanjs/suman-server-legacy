/**
 * Created by denmanm1 on 3/31/16.
 */

const React = require('react');
const ReactDOM = require('react-dom');


module.exports = function (Parent, parentProps, Child, childDataArray, documentId) {

    const children = childDataArray.map(function (props) {

        console.log('childDataArray => ', props);

        return (
            <Child {...props} />
        )

    });

    ReactDOM.render(
        <Parent {...parentProps}>
            {children}
        </Parent>, document.getElementById(documentId));

};

