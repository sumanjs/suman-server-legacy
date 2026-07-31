const React = require('react');
const ReactDOM = require('react-dom');


var ContactItem = React.createClass({
    propTypes: {
        name: React.PropTypes.string.isRequired
    },

    render: function () {
        return (
            React.createElement('li', {className: 'Contact'},
                React.createElement('h2', {className: 'Contact-name'}, this.props.name)
            )
        )
    }
});

var element = React.createElement(ContactItem, {name: "James K Nelson"});

document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(element, document.getElementById('react-app'));
});




