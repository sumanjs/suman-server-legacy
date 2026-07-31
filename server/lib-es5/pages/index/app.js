'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var ContactItem = React.createClass({
    displayName: 'ContactItem',

    propTypes: {
        name: React.PropTypes.string.isRequired
    },

    render: function render() {
        return React.createElement('li', { className: 'Contact' }, React.createElement('h2', { className: 'Contact-name' }, this.props.name));
    }
});

var element = React.createElement(ContactItem, { name: "James K Nelson" });

document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(element, document.getElementById('react-app'));
});