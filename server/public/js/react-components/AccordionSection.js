define(function (require, exports, module) {'use strict';

let React = require('react');
let $ = require('jquery');
let ReactDOM = require('react-dom');

let TestFileSuite = require('./TestFileSuite');

let AccordionSection = React.createClass({
    displayName: 'AccordionSection',


    getInitialState: function getInitialState() {

        return {
            loaded: false,
            testData: []
        };
    },

    render: function render() {

        let className = 'accordion-section' + (this.props._selected ? ' selected' : '');

        // <div className='body'>
        //     {this.props.children}
        // </div>

        return React.createElement(
            'div',
            { className: className },
            React.createElement(
                'h3',
                { onClick: this.onSelect },
                this.props.title
            ),
            React.createElement(
                'div',
                { className: 'body' },
                React.createElement(TestFileSuite, { data: this.state.testData })
            )
        );
    },

    onSelect: function onSelect(e) {
        let _this = this;

        console.log('event:', e);
        // tell the parent Accordion component that this section was selected
        this.props._onSelect(this.props.id);

        if (!this.state.loaded) {
            this.state.loaded = true;

            $.ajax({
                type: 'GET',
                url: '/results/' + this.props.runId + '/' + this.props.testId

            }).done(function (resp) {

                console.log('resp:', resp);
                _this.state.testData = JSON.parse(resp);
                _this.forceUpdate();
            }).fail(function () {

                _this.state.testData = 'Bad server response';
                _this.forceUpdate();
            });
        }
    }
});

module.exports = AccordionSection;
});
