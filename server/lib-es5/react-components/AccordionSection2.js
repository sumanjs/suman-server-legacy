'use strict';

let React = require('react');

let Section = React.createClass({
    displayName: 'Section',


    handleClick: function handleClick(e) {

        console.log('event:', e);

        if (this.state.open) {
            this.setState({
                open: false,
                class: "section"
            });
        } else {
            this.setState({
                open: true,
                class: "section open"
            });
        }
    },
    getInitialState: function getInitialState() {
        return {
            open: false,
            class: "section"
        };
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: this.state.class },
            React.createElement(
                'button',
                null,
                'toggle'
            ),
            React.createElement(
                'div',
                { className: 'sectionhead', onClick: this.handleClick },
                this.props.title
            ),
            React.createElement(
                'div',
                { className: 'articlewrap' },
                React.createElement(
                    'div',
                    { className: 'article' },
                    this.props.children
                )
            )
        );
    }
});

module.exports = Section;